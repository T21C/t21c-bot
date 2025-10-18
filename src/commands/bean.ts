import {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    Interaction,
    ChatInputCommandInteraction
} from 'discord.js'
import '../index'

module.exports = {
    checkPerms: {
        condition: (interaction: Interaction) =>
            interaction.client.jejudo.isOwner(interaction.user),
        permsName: 'Bot Owner'
    },
    tufOnly: true,
    data: new SlashCommandBuilder()
        .setName('bean')
        .setDescription('Beans a member from the TUF server.')
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('The user you want to bean')
                .setRequired(true)
        )
        .addUserOption((option) =>
            option.setName('mod').setDescription('The moderator doing the bean')
        )
        .addStringOption((option) =>
            option.setName('reason').setDescription('The reason for your ban')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    execute(interaction: ChatInputCommandInteraction) {
        const user = interaction.options.getUser('user', true)
        const mod = interaction.options.getUser('mod') || interaction.user
        const reason = interaction.options.getString('reason')
        const embed = new EmbedBuilder()
            .setTitle(':white_check_mark: Banned')
            .addFields(
                { name: 'User', value: `${user}` },
                { name: 'Mod', value: `${mod}` },
                { name: 'Reason', value: reason || '(blank)' }
            )
            .setColor(0xff0000)

        return interaction.reply({ embeds: [embed] })
    }
}
