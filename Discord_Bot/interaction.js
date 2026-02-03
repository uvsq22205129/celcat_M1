const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags,TextInputBuilder, TextInputStyle, ModalBuilder, LabelBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder,ChatInputCommandInteraction, ButtonInteraction, StringSelectMenuInteraction, ModalSubmitInteraction} = require('discord.js');
const {Edt} = require('./edt');
const {ManageGroup} = require('./manageGroup');
const {ListGroup} = require('./listGroup');
const group = require('./group');
const CelcatGroups = require('./celcatGroups');
const celcatToJson = require('./celcatToJson');
const viewType = require('./viewType');

class InteractePars{
    /**
     * 
     * @param {ChatInputCommandInteraction|ButtonInteraction|StringSelectMenuInteraction|ModalSubmitInteraction} interaction 
     */
    constructor(interaction){
        this.interaction = interaction;
    }
    async parse(){
        if(this.interaction.isButton()){
            const buttonId = this.interaction.customId;
            if(buttonId === 'group'){
                await this.groupParsing();
            }else if(buttonId === 'edt'){
                await this.edtParse();
            }else if(buttonId === 'button_add'){
                await this.inputAddGroup();
            }else if(buttonId === 'button_remove'){
                await this.groupDelSelect();
            }
        }
        if(this.interaction.isChatInputCommand())
            {if(this.interaction.commandName === 'menu'){
                await this.menubar();
            }
        }
        if (this.interaction.isModalSubmit()){
            if(this.interaction.customId === 'edtModal'){
                await this.printEdt();
            }else if(this.interaction.customId === 'addModal'){
                // await this.addgroup();
                await this.selectTD();
            }
        }
        if(this.interaction.isStringSelectMenu()){
            if(this.interaction.customId === 'list_group'){
                await this.removeGroup();
            }
            if(this.interaction.customId === 'select_group'){
                await this.selectUE();
            }
            if(this.interaction.customId === 'selct_codeUE'){
                await this.addgroup();
            }
        }
    }
    async menubar(){
        const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId('group').setLabel('group').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('edt').setLabel('edt').setStyle(ButtonStyle.Primary)
        );
        // await this.interaction.editReply({
        await this.interaction.reply({
            content: 'Menu de gestion de l\'emploi du temps:',
            components: [row],
            // flags: MessageFlags.Ephemeral,
        });
    }
    
    async edtParse(){
        const modal = new ModalBuilder()
        .setCustomId('edtModal')
        .setTitle('fait ton choix');

        const timeSelect = new StringSelectMenuBuilder().setCustomId('view_selection').setRequired(true)
        .addOptions(
            new StringSelectMenuOptionBuilder().setDefault(true)
            .setLabel('jour')
            .setValue('day')
            .setDescription('affiche l\'emploi du temps de la journée'),
            new StringSelectMenuOptionBuilder()
            .setLabel('semaine')
            .setValue('week')
            .setDescription('affiche l\'emploi du temps de la semiane'),
        );

        const select_label = new LabelBuilder().setLabel('selectioner un affichage')
        .setStringSelectMenuComponent(timeSelect);

        const input = new TextInputBuilder().setCustomId('input_num')
        .setMaxLength(5)
        .setMinLength(0)
        .setValue('+0')
        .setPlaceholder('ex: +2 | -2 | 23/07')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

        const input_label = new LabelBuilder().setLabel("specifier une ")
        .setDescription('(+,-)num : affiche l\'edt dans num (jours, semaines)\ndd/mm : affiche l\'edt de la date donner')
        .setTextInputComponent(input);

        modal.addLabelComponents(select_label, input_label);

        await this.interaction.showModal(modal);
    }

    async groupParsing(){
        await this.interaction.deferReply({flags: MessageFlags.Ephemeral});
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel('Add group').setCustomId('button_add').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setLabel('Remove group').setCustomId('button_remove').setStyle(ButtonStyle.Primary),
        )
        await this.interaction.editReply({
            components: [row],
            flags: MessageFlags.Ephemeral,
        });
    }

    async groupDelSelect(){
        await this.interaction.deferReply({flags: MessageFlags.Ephemeral});

        const groups_menu = new StringSelectMenuBuilder()
        .setCustomId('list_group')
        .setPlaceholder('select group');

        let groups = new ManageGroup(this.interaction.user.id);
        groups.getList().forEach(e_group => {
            groups_menu.addOptions(
                new StringSelectMenuOptionBuilder()
                .setValue(`${e_group.UECode} ${e_group.groupCode}`)
                .setLabel(`${e_group.UECode} - ${e_group.groupCode}`)
            );
        });
        const row = new ActionRowBuilder().addComponents(groups_menu);
        this.interaction.editReply({
            components: [row],
            flags: MessageFlags.Ephemeral,
        });
    }

    async inputAddGroup(){
        const modal = new ModalBuilder().setCustomId('addModal')
        .setTitle('Donne moi quelque information');

        const selectFiliere = new StringSelectMenuBuilder().setCustomId('select_filiere').setRequired(true)
        .addOptions(
            new StringSelectMenuOptionBuilder().setDefault(true)
            .setLabel('M1 info')
            .setValue('m1 info')
            .setDescription('pour les M1 info'),
            new StringSelectMenuOptionBuilder()
            .setLabel('others')
            .setValue('null')
            .setDescription('Pour les autre '),
        );

        const inputFilire = new TextInputBuilder().setCustomId('input_filiere').setRequired(false)
        .setPlaceholder('ex: s6 info\t(seulement pour others)')
        .setStyle(TextInputStyle.Short);
        
        const labelSelectFiliere = new LabelBuilder().setStringSelectMenuComponent(selectFiliere).setLabel('votre cursus');
        const labelFilere = new LabelBuilder().setTextInputComponent(inputFilire).setLabel('enterer votre filirer si other');
        modal.setLabelComponents(labelSelectFiliere, labelFilere);

        await this.interaction.showModal(modal);
    }

    async selectTD(){
        await this.interaction.deferReply({flags: MessageFlags.Ephemeral});
        const groupCode = this.interaction.fields.getField('select_filiere').values[0];
        let ressource = groupCode;
        if (groupCode === 'null'){
            ressource = this.interaction.fields.getTextInputValue('input_filiere');
        }
        //recuperation des group
        // console.log(ressource);
        const l_groups = new CelcatGroups();
        const data = await l_groups.getJson(ressource);
        const jsondata = JSON.parse(data);
        // console.log(jsondata.results);
        //affichage dans un StringSelectMenu
        const selectGroup = new StringSelectMenuBuilder().setCustomId('select_group');

        jsondata.results.forEach( elem => {
            selectGroup.addOptions(
            new StringSelectMenuOptionBuilder().setDefault(false)
            .setLabel(elem.id)
            .setValue(elem.id.replaceAll(' ', '+'))
            .setDescription(elem.text)
            );
        });

        const raw = new ActionRowBuilder().addComponents(selectGroup);

        await this.interaction.editReply({
            content: 'select group',
            components: [raw],
            falgs: MessageFlags.Ephemeral,
        })
    }

    async selectUE(){
        await this.interaction.deferReply({flags: MessageFlags.Ephemeral});
        const groupid = this.interaction.values[0];
        //recuperation de tout les cours de l'année
        const celcat = new celcatToJson('',viewType.MONTH);
        const jsondata = await celcat.getCalandarData('2026-01-01','2026-12-31','103',groupid,'3');
        let rep = new Set();
        jsondata.forEach(elem =>{
            const cours = `${elem.modules}`.split('-')[0].trim();
            cours.split(',').forEach(cour =>{
                rep.add(cour);
            })
        });

        //recuperer la description de chaque cours
        const codeUE = new StringSelectMenuBuilder().setCustomId('selct_codeUE');
        const celcatUe = new CelcatGroups('100');

        await Promise.all(Array.from(rep).map(async (code) => {
            const data = await celcatUe.getJson(code);
            const jsondata = JSON.parse(data);
            let text = 'null';
            try{
                text = jsondata.results[0].text;
            }catch{
                text = 'null';
            }
            codeUE.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(`${code}`)
                    .setValue(`${code} ${groupid}`)
                    .setDescription(text.substring(0, 100))
            );
        }));

        const raw = new ActionRowBuilder().addComponents(codeUE);
        await this.interaction.editReply({
            content: 'choix des UE',
            components: [raw],
            flags: MessageFlags.Ephemeral,
        });
    }

    async removeGroup(){
        await this.interaction.deferReply({flags: MessageFlags.Ephemeral});

        const Uecode = this.interaction.values[0].split(' ')[0];
        const num_td = this.interaction.values[0].split(' ')[1];

        const groups = new ManageGroup(this.interaction.user.id);
        groups.removeGroup(Uecode, num_td);

        await this.interaction.editReply({
            content: `suppressions de: ${Uecode}-${num_td}`,
            flags: MessageFlags.Ephemeral,
        })
    }

    async addgroup(){
        await this.interaction.deferReply({flags: MessageFlags.Ephemeral});

        const Uecode = this.interaction.values[0].split(' ')[0];
        const num_td = this.interaction.values[0].split(' ')[1];
        // const Uecode = this.interaction.fields.getTextInputValue('input_ue');
        // const num_td = this.interaction.fields.getTextInputValue('input_td');

        const groups = new ManageGroup(this.interaction.user.id);
        groups.addGroup(Uecode, num_td);

        await this.interaction.editReply({
            content: `ajout du groupe ${Uecode} - ${num_td}`,
            flags: MessageFlags.Ephemeral,
        });
    }
    async printEdt(){
        try{
            await this.interaction.deferReply({ ephemeral: true });
        }catch{
            await this.interaction.channel.send("/menu");
            return;
        }
        
        console.log(this.interaction.fields);
        const num = this.interaction.fields.getTextInputValue('input_num');
        const view = this.interaction.fields.getField('view_selection').values[0];
        const edt = new Edt(this.interaction.user.id, view, num);
        let rep = `edt for <@${this.interaction.user.id}>\n`;
        await this.interaction.editReply({
            content : `${await edt.getStringEdt(rep)}`,
            flags: MessageFlags.Ephemeral,
        });
    }
}

module.exports = (InteractePars);