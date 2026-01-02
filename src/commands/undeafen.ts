import {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    Interaction,
    ChatInputCommandInteraction
} from 'discord.js'
import '../index'

module.exports = {
    tufOnly: true,
    data: new SlashCommandBuilder()
        .setName('undeafen')
        .setDescription('Undeafen yourself.'),
    execute(interaction: ChatInputCommandInteraction) {
        const member = interaction.guild.members.cache.get(interaction.user.id)
        if (!member.voice) {
            return interaction.reply({
                content: 'You are not in a voice channel.',
                ephemeral: true
            })
        }

        member.voice.setDeaf(false, `/undeafen`)
        return interaction.reply({
            content: `You have been undeafened.`,
            ephemeral: true
        })
    }
}
