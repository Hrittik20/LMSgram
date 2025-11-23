const TelegramBot = require('node-telegram-bot-api');
const { userQueries } = require('./database');

let bot;

function initBot(token, webAppUrl) {
  bot = new TelegramBot(token, { polling: true });

  // Start command
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const user = msg.from;

    try {
      // Check if user exists
      let dbUser = await userQueries.findByTelegramId(user.id.toString());
      
      // Create user if doesn't exist
      if (!dbUser) {
        await userQueries.create(
          user.id.toString(),
          user.username || '',
          user.first_name || '',
          user.last_name || '',
          'student'
        );
      }

      const keyboard = {
        inline_keyboard: [
          [{ text: '📚 Open LMS', web_app: { url: webAppUrl } }],
          [{ text: '👨‍🏫 Become a Teacher', callback_data: 'become_teacher' }]
        ]
      };

      bot.sendMessage(
        chatId,
        `Welcome to LMS Bot! 🎓\n\n` +
        `This is your personal learning management system.\n\n` +
        `✅ Join courses\n` +
        `✅ Submit assignments\n` +
        `✅ Track your grades\n` +
        `✅ Receive notifications\n\n` +
        `Click the button below to get started!`,
        { reply_markup: keyboard }
      );
    } catch (error) {
      console.error('Error in /start command:', error);
      bot.sendMessage(chatId, 'Sorry, something went wrong. Please try again.');
    }
  });

  // Help command
  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
      chatId,
      `📖 *LMS Bot Help*\n\n` +
      `*Commands:*\n` +
      `/start - Start the bot and open LMS\n` +
      `/help - Show this help message\n` +
      `/role - Check your current role\n\n` +
      `*Features:*\n` +
      `• Create and join courses\n` +
      `• Submit and grade assignments\n` +
      `• Share course materials\n` +
      `• Post announcements\n` +
      `• Track student progress\n\n` +
      `*Getting Started:*\n` +
      `1. Click "Open LMS" button\n` +
      `2. Teachers: Create courses\n` +
      `3. Students: Join with course code\n` +
      `4. Start learning! 🚀`,
      { parse_mode: 'Markdown' }
    );
  });

  // Role command
  bot.onText(/\/role/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    try {
      const user = await userQueries.findByTelegramId(userId);
      if (user) {
        const roleEmoji = user.role === 'teacher' ? '👨‍🏫' : '👨‍🎓';
        bot.sendMessage(
          chatId,
          `Your current role: ${roleEmoji} *${user.role.toUpperCase()}*`,
          { parse_mode: 'Markdown' }
        );
      } else {
        bot.sendMessage(chatId, 'User not found. Please use /start first.');
      }
    } catch (error) {
      console.error('Error in /role command:', error);
      bot.sendMessage(chatId, 'Error retrieving role information.');
    }
  });

  // Callback query handler
  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const userId = query.from.id.toString();
    const data = query.data;

    if (data === 'become_teacher') {
      try {
        const user = await userQueries.findByTelegramId(userId);
        if (user) {
          await userQueries.updateRole(user.id, 'teacher');
          bot.answerCallbackQuery(query.id, { text: 'You are now a teacher! 👨‍🏫' });
          bot.sendMessage(
            chatId,
            '🎉 Congratulations! You are now a teacher.\n\n' +
            'You can now:\n' +
            '• Create courses\n' +
            '• Post assignments\n' +
            '• Grade submissions\n' +
            '• Manage your classes\n\n' +
            'Open the LMS to get started!'
          );
        }
      } catch (error) {
        console.error('Error updating role:', error);
        bot.answerCallbackQuery(query.id, { text: 'Error updating role' });
      }
    }
  });

  // Handle errors
  bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
  });

  console.log('Telegram bot started successfully');
  return bot;
}

function sendNotification(telegramId, message) {
  if (bot) {
    bot.sendMessage(telegramId, message);
  }
}

module.exports = { initBot, sendNotification };

