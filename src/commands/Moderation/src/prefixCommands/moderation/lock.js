export default {
  name: 'lock',
  aliases: ['l'],
  description: 'Lock the current channel',
  usage: '$lock',
  category: 'moderation',

  async execute(message, args, client) {
    if (!message.member.permissions.has('ManageChannels')) {
      return message.reply('❌ You need permission to manage channels');
    }

    try {
      await message.channel.permissionOverwrites.edit(message.guild.id, {
        SendMessages: false,
        AddReactions: false,
      });
      message.reply('🔒 Channel locked');
    } catch (error) {
      message.reply(`❌ Error: ${error.message}`);
    }
  }
};
