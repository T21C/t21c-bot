import {
    SlashCommandBuilder,
    EmbedBuilder,
    ApplicationIntegrationType,
    InteractionContextType,
    ChatInputCommandInteraction
} from 'discord.js'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('calcacc')
        .setDescription('Calculates the accuracy of a play')
        .addStringOption((option) =>
            option
                .setName('judgementlist')
                .setDescription(
                    'The list of judgements in order, split with spaces'
                )
                .setRequired(true)
        )
        .setIntegrationTypes(
            ApplicationIntegrationType.GuildInstall,
            ApplicationIntegrationType.UserInstall
        )
        .setContexts(
            InteractionContextType.BotDM,
            InteractionContextType.Guild,
            InteractionContextType.PrivateChannel
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const judgementList = interaction.options.getString(
            'judgementlist',
            true
        )

        let judgements
        judgements = judgementList.split(' ')
        if (judgements.length < 7 || judgements.length > 9) {
            await interaction.reply({
                content: 'Invalid length.',
                ephemeral: true
            })
            return
        }

        const isNum = judgements.every((num) => !isNaN(num))
        if (!isNum) {
            await interaction.reply({
                content: 'Only numbers are accepted.',
                ephemeral: true
            })
            return
        }
        judgements = judgements.map((num) => Number(num))

        const isPositive = judgements.every((num) => num >= 0)
        if (!isPositive) {
            await interaction.reply({
                content: 'Negative value detected.',
                ephemeral: true
            })
            return
        }

        const isInt = judgements.every((num) => num % 1 === 0)
        if (!isInt) {
            await interaction.reply({
                content: 'Decimal number detected.',
                ephemeral: true
            })
            return
        }

        let overload, tEarly, early, earlyP, perfect, lateP, late, tLate, miss
        if (judgements.length == 7) {
            tEarly = judgements[0]
            early = judgements[1]
            earlyP = judgements[2]
            perfect = judgements[3]
            lateP = judgements[4]
            late = judgements[5]
            tLate = judgements[6]
        }
        if (judgements.legnth == 8) {
            tEarly = judgements[0]
            early = judgements[1]
            earlyP = judgements[2]
            perfect = judgements[3]
            lateP = judgements[4]
            late = judgements[5]
            tLate = judgements[6]
            miss = judgements[7]
        }
        if (judgements.length == 9) {
            overload = judgements[0]
            tEarly = judgements[1]
            early = judgements[2]
            earlyP = judgements[3]
            perfect = judgements[4]
            lateP = judgements[5]
            late = judgements[6]
            tLate = judgements[7]
            miss = judgements[8]
        }

        const judgeCount =
            (overload || 0) +
            tEarly +
            early +
            earlyP +
            perfect +
            lateP +
            late +
            tLate +
            (miss || 0)

        const acc =
            Math.round(
                (perfect * 0.01 +
                    ((earlyP + perfect + lateP) / judgeCount) * 100) *
                    100000
            ) / 100000
        const xacc =
            Math.round(
                ((perfect * 100 +
                    (earlyP + lateP) * 75 +
                    (early + late) * 40 +
                    (tEarly + tLate) * 20) /
                    judgeCount) *
                    100000
            ) / 100000

        const embed = new EmbedBuilder()
            .setTitle(`X-Accuracy: ${xacc}% | Legacy Accuracy: ${acc}%`)
            .setDescription(
                `Judgements:\n\n${overload ? `${overload} Overloads\n` : ''}${tEarly} Early!!s\n${early} Early!s\n${earlyP} EPerfect!s\n${perfect} Perfect!s\n${lateP} LPerfect!s\n${late} Late!s\n${tLate} Late!!s${miss ? `\n${miss} Misses` : ''}`
            )
            .setColor('#2f0565')
        interaction.reply({ embeds: [embed] })
    }
}
