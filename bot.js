const TelegramBot = require('node-telegram-bot-api');
const { userQueries } = require('./database');

let bot;

function initBot(token, webAppUrl, useWebhook = false, webhookUrl = null) {
  // Use webhook mode for production, polling for local development
  if (useWebhook && webhookUrl) {
    bot = new TelegramBot(token);
    // Webhook will be set up separately
    console.log('Bot initialized in webhook mode');
  } else {
    bot = new TelegramBot(token, { polling: true });
    console.log('Bot initialized in polling mode (local development)');
  }

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

      // Check if Web App URL is HTTPS (required by Telegram)
      const isHttps = webAppUrl && webAppUrl.startsWith('https://');
      
      let keyboard = {
        inline_keyboard: []
      };

      if (isHttps) {
        // Add Web App button if URL is HTTPS
        keyboard.inline_keyboard.push([
          { text: '📚 Open LMS', web_app: { url: webAppUrl } }
        ]);
      }
      
      // Always add the teacher button
      keyboard.inline_keyboard.push([
        { text: '👨‍🏫 Become a Teacher', callback_data: 'become_teacher' }
      ]);

      let welcomeMessage = `Welcome to LMS Bot! 🎓\n\n` +
        `This is your personal learning management system.\n\n` +
        `✅ Join courses\n` +
        `✅ Submit assignments\n` +
        `✅ Track your grades\n` +
        `✅ Receive notifications\n\n`;

      if (isHttps) {
        welcomeMessage += `Click the button below to get started!`;
      } else {
        welcomeMessage += `⚠️ Web App is not configured.\n` +
          `For local development, use ngrok to create an HTTPS tunnel.\n` +
          `See NEXT_STEPS.md for instructions.`;
      }

      bot.sendMessage(chatId, welcomeMessage, { reply_markup: keyboard });
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

// Set up webhook for production
async function setWebhook(token, webhookUrl) {
  if (!bot) {
    bot = new TelegramBot(token);
  }
  
  try {
    await bot.setWebHook(webhookUrl);
    console.log(`✅ Webhook set to: ${webhookUrl}`);
    return true;
  } catch (error) {
    console.error('❌ Error setting webhook:', error);
    return false;
  }
}

// Get webhook info
async function getWebhookInfo() {
  if (!bot) return null;
  
  try {
    const info = await bot.getWebHookInfo();
    return info;
  } catch (error) {
    console.error('Error getting webhook info:', error);
    return null;
  }
}

async function sendNotification(telegramId, message, options = {}) {
  if (!bot) {
    console.error('Bot not initialized');
    return;
  }

  try {
    await bot.sendMessage(telegramId, message, {
      parse_mode: 'Markdown',
      ...options
    });
  } catch (error) {
    // Handle common errors
    if (error.response?.statusCode === 403) {
      console.log(`User ${telegramId} blocked the bot`);
    } else {
      console.error(`Error sending notification to ${telegramId}:`, error.message);
    }
  }
}

module.exports = { initBot, sendNotification, setWebhook, getWebhookInfo, getBot: () => bot };












