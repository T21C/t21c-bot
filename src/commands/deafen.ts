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
        .setName('deafen')
        .setDescription('Deafen a member in a good run.')
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('The user you want to deafen')
                .setRequired(true)
        ),
    execute(interaction: ChatInputCommandInteraction) {
        const user = interaction.options.getUser('user', true)

        const member = interaction.guild.members.cache.get(user.id)
        if (!member) {
            return interaction.reply({
                content: 'The user is not in TUF.',
                ephemeral: true
            })
        }
        if (!member.voice) {
            return interaction.reply({
                content: 'The member is not in a voice channel.',
                ephemeral: true
            })
        }

        member.voice.setDeaf(true, `/deafen by ${interaction.user.username}`)
        return interaction.reply({
            content: `${user} has been deafened.`,
            ephemeral: true
        })
    }
}
