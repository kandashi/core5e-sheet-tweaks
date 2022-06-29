Hooks.once('init', async function () {
    game.settings.register("core5e-sheet-tweaks", "fullColour", {
        name: 'Item useage dot color',
        scope: 'client',
        type: String,
        default: "#b33737",
        config: true,
        onChange: refresh
    });
    game.settings.register("core5e-sheet-tweaks", "attunementColour", {
        name: 'Item Attunement color',
        scope: 'client',
        type: String,
        default: "#7a7971",
        config: true,
        onChange: refresh
    });
    game.settings.register("core5e-sheet-tweaks", "nonattunedColour", {
        name: 'Item Not-Attuned color',
        scope: 'client',
        type: String,
        default: "#44191A",
        config: true,
        onChange: refresh
    });
    
})
Hooks.on('renderSettingsConfig', (app, el, data) => {
    let fC = game.settings.get("core5e-sheet-tweaks", "fullColour");
    let aT = game.settings.get("core5e-sheet-tweaks", "attunementColour");
    let nA = game.settings.get("core5e-sheet-tweaks", "nonattunedColour");

    el.find('[name="core5e-sheet-tweaks.fullColour"]').parent().append(`<input type="color" value="${fC}" data-edit="core5e-sheet-tweaks.fullColour">`)
    el.find('[name="core5e-sheet-tweaks.attunementColour"]').parent().append(`<input type="color" value="${aT}" data-edit="core5e-sheet-tweaks.attunementColour">`)
    el.find('[name="core5e-sheet-tweaks.nonattunedColour"]').parent().append(`<input type="color" value="${nA}" data-edit="core5e-sheet-tweaks.nonattunedColour">`)

})

Hooks.on("ready", refresh)

Hooks.on("renderActorSheet", (sheet, html) => {
    let options = ["pact", "spell1", "spell2", "spell3", "spell4", "spell5", "spell6", "spell7", "spell8", "spell9",]
    for (let o of options) {
        let max = html.find(`.spell-max[data-level=${o}]`)
        let name = max.closest(".spell-slots")
        let data = sheet.object.data.data.spells[o]
        if (data.max === 0) continue
        let contents = ``
        for (let i = data.max; i > 0; i--) {
            if (i <= data.value) contents += `<span class="dot"></span>`
            else contents += `<span class="dot empty"></span>`
        }
        name.before(contents)
    }
    let itemUses = sheet.object.items.filter(i => i.hasLimitedUses)
    for (let o of itemUses) {
        let itemHTML = html.find(`.item[data-item-id=${o.id}]`)
        let name = itemHTML.find(".item-name")
        let data = o.data.data.uses
        if (data.max === 0) continue
        let contents = ``
        //let contents = `<div>`
        for (let i = data.max; i > 0; i--) {
            if (i <= data.value) contents += `<span class="dot"></span>`
            else contents += `<span class="dot empty"></span>`
        }
        if (o.type === "spell") {
            name = name.find(".item-detail.spell-uses")
            name.before(contents)
        }
        //contents += "</div>"
        else { name.after(contents) }
    }
    html.find('.dot')
        .click(async ev => {
            const actor = sheet.object
            const li = $(ev.currentTarget).parents(".item");
            const item = actor.items.get(li.data("itemId"));
            let spellLevel
            if (!item) {
                spellLevel = ev.currentTarget.parentElement.outerHTML.match(/data-level="(.*?)"/)[1]
            }
            if (!item && spellLevel) {
                let path = `data.spells.${spellLevel}.value`
                if (ev.currentTarget.classList.contains("empty")) {
                    await actor.update({ [path]: actor.data.data.spells[spellLevel].value + 1 })
                }
                else {
                    await actor.update({ [path]: actor.data.data.spells[spellLevel].value - 1 })
                }

            }
            else if (ev.currentTarget.classList.contains("empty")) {
                await item.update({ "data.uses.value": item.data.data.uses.value + 1 })
            }
            else {
                await item.update({ "data.uses.value": item.data.data.uses.value - 1 })
            }
        });

})

function refresh() {
    const fC = game.settings.get("core5e-sheet-tweaks", "fullColour");
    const aT = game.settings.get("core5e-sheet-tweaks", "attunementColour");
    const nA = game.settings.get("core5e-sheet-tweaks", "nonattunedColour");

    document.documentElement.style.setProperty('--fullColour', fC);
    document.documentElement.style.setProperty('--attunedColor', aT);
    document.documentElement.style.setProperty('--notAttunedColor', nA);

}