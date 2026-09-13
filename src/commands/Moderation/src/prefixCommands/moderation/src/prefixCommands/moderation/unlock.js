export default {
  name: 'unlock',
  aliases: ['ul'],
  description: 'Unlock the current channel',
  usage: '$unlock',
  category: 'moderation',

  async execute(message, args, client) {
    if (!message.member.permissions.has('ManageChannels')) {
      return message.reply('❌ You need permission to manage channels');
    }

    try {
      await message.channel.permissionOverwrites.edit(message.guild.id, {
        SendMessages: true,
        AddReactions: true,
      });
      message.reply('🔓 Channel unlocked');
    } catch (error) {
      message.reply(`❌ Error: ${error.message}`);
    }
  }
};
