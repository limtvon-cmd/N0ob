import TicketService from '../../services/ticketService.js';
import { Modal, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

export default [
  {
    name: 'ticket_close',
    async execute(interaction) {
      const ticketService = new TicketService(interaction.client);
      try {
        await interaction.deferReply();
        await ticketService.closeTicket(interaction.channel, interaction.user);
        await interaction.editReply('🔒 Ticket closed successfully');
      } catch (error) {
        await interaction.editReply('❌ Error closing ticket');
      }
    },
  },
  {
    name: 'ticket_claim',
    async execute(interaction) {
      const ticketService = new TicketService(interaction.client);
      try {
        await interaction.deferReply();
        await ticketService.claimTicket(interaction.channel, interaction.user);
        await interaction.editReply('✅ Ticket claimed');
      } catch (error) {
        await interaction.editReply('❌ Error claiming ticket');
      }
    },
  },
  {
    name: 'ticket_rename',
    async execute(interaction) {
      const modal = new Modal()
        .setCustomId('ticket_rename_modal')
        .setTitle('Rename Ticket')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('new_ticket_name')
              .setLabel('New Ticket Name')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          )
        );

      await interaction.showModal(modal);
    },
  },
];
