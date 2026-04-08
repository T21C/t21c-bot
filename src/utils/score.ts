export const calculatePP = (
    xacc,
    speed = 1.0,
    baseScore,
    isDesertBus,
    tileCount,
    misses,
    isNoHoldTap
) => {
    const gmConst = 315
    const start = 1
    const end = 50
    const startDeduc = 10
    const endDeduc = 50
    const pwr = 0.7

    let xaccMtp = 0
    let speedMtp = 0
    let scorev2Mtp = 0

    let score = 0
    let scorev2 = 0

    //get xacc multiplier
    if (xacc < 95) {
        xaccMtp = 1
    } else if (xacc < 100) {
        xaccMtp = -0.027 / (xacc / 100 - 1.0054) + 0.513
    } else if (xacc === 100) {
        const a = 2100
        const k = 14
        const h = -a / (k - 6)

        xaccMtp = -a / (baseScore - h) + k
    }

    //get speed multiplier
    if (isDesertBus) {
        if (speed == 1) {
            speedMtp = 1
        } else if (speed > 1) {
            speedMtp = 2 - speed
        }
    } else {
        if (speed < 1) {
            speedMtp = 0
        } else if (speed < 1.1) {
            speedMtp = -3.5 * speed + 4.5
        } else if (speed < 1.5) {
            speedMtp = 0.65
        } else if (speed < 2) {
            speedMtp = 0.7 * speed - 0.4
        } else {
            speedMtp = 1
        }
    }

    //get scorev2 multiplier
    if (misses == 0) {
        scorev2Mtp = 1.1
    } else {
        let tp = (start + end) / 2
        let tpDeduc = (startDeduc + endDeduc) / 2
        let am = Math.max(0, misses - Math.floor(tileCount / gmConst))

        if (am === 0) {
            scorev2Mtp = 1
        } else if (am <= start) {
            scorev2Mtp = 1 - startDeduc / 100
        } else if (am <= tp) {
            let kOne =
                (Math.pow((am - start) / (tp - start), pwr) *
                    (tpDeduc - startDeduc)) /
                100
            scorev2Mtp = 1 - startDeduc / 100 - kOne
        } else if (am <= end) {
            const kTwo =
                (Math.pow((end - am) / (end - tp), pwr) *
                    (endDeduc - tpDeduc)) /
                100
            scorev2Mtp = 1 + kTwo - endDeduc / 100
        } else {
            scorev2Mtp = 1 - endDeduc / 100
        }
    }

    //get score
    if (isDesertBus) {
        score = Math.max(1, baseScore * xaccMtp * speedMtp)
    } else {
        score = baseScore * xaccMtp * speedMtp
    }

    //get scorev2
    if (isNoHoldTap) {
        scorev2Mtp *= 0.9
    }
    scorev2 = score * scorev2Mtp

    return scorev2
}
