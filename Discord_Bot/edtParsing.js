const group = require("./group")
const ListGroup = require("./listGroup");
const fs = require('fs');
const celcatToJson = require('./celcatToJson');
const jsonToCours = require('./jsonToCours');
const viewType = require('./viewType');
const { resolve } = require("dns");

const tab = "  ";
let mp = 0;
/**
 * 
 * @param {string} data 
 * @param {ListGroup} listAuthor 
 * @param {OmitPartialGroupDMChannel<Message<boolean>>} message
 */
function parseEdt(data,authorId,message){
    mp = 0;
    console.log("data: ",data);
    if(data.toLowerCase().startsWith('mp')){
        data = data.toLocaleLowerCase().split('mp')[1].trim();
        mp = 1;
    }
    if (data.toLowerCase().startsWith("edt")){
        const parts = data.split(' ');
        if (parts.length == 1){
            printEdtDay(authorId, message);
            return;
        }else if (parts[1].toLocaleLowerCase() == "group" && parts.length >= 5){
            return groupParse(parts.slice(2),authorId);
        }
        let spec = null;
        if (parts.length === 3){
            spec = parts[2];
        }
        if (parts[1].toLowerCase() == "jour" || parts[1].toLowerCase() == "day"){
            printEdtDay(authorId, message,spec);
        }
        else if (parts[1].toLowerCase() == "week" || parts[1].toLowerCase() == "semaine"){
            printEdtWeek(authorId, message,spec);
        }else if ((parts[1].toLowerCase() == "tomorrow" || parts[1].toLowerCase() == "demain") && parts.length == 2){
            printEdtTomorrow(authorId, message);
        }else{
            message.reply(help());
        }
    }else if (data.toLocaleLowerCase().startsWith("spy")){
        const parts = data.split(' ');
        let spec = null;
        const spy = parts[1].split('<@')[1].split('>')[0];
        if (parts.length === 4){
            spec = parts[3];
        }
        if (parts.length === 2){
            printEdtDay(authorId,message,spec,spy);
            return;
        }
        if (parts[2].toLowerCase() == "jour" || parts[2].toLowerCase() == "day"){
            printEdtDay(authorId, message,spec,spy);
        }
        else if (parts[2].toLowerCase() == "week" || parts[2].toLowerCase() == "semaine"){
            printEdtWeek(authorId, message,spec,spy);
        }else if ((parts[2].toLowerCase() == "tomorrow" || parts[2].toLowerCase() == "demain") && parts.length == 3){
            printEdtTomorrow(authorId, message,spy);
        }else{
            message.reply(helpSpy());
        }
    }else if(data.toLowerCase().startsWith('help') || data.toLowerCase().startsWith('?')){
        message.channel.send(help());
    }
}
/**
 * use when command is "edt group add UEcode Td_number"
 * or when command is "edt group remove UEcode Td_number"
 * @param {[string]} data 
 * @param {string} authorId 
 */
function groupParse(data,authorId){
    if (data[0] == "add"){
        console.log("add group");
        const groupToAdd = new group(data[1],`M1+Info+gr.+${data[2]}`);
        let list_group = getGroup(authorId);
        list_group.addGroup(groupToAdd);
        writeGroup(authorId,list_group)
        console.log(authorId, data[1], data[2]);
        return `group ${data[1]} ${data[2]} added`;
    }else if (data[0] == "remove"){
        console.log("remove group");
        const groupToRemove = new group(data[1],`M1+Info+gr.+${data[2]}`);
        let list_group = getGroup(authorId);
        list_group.removeGroup(groupToRemove);
        writeGroup(authorId,list_group);
        return `group ${data[1]} M1+Info+gr.+${data[2]} removed`;
    }
}

function printEdt(startDate, endDate, authorId,message,spy=null){
    let rep = `c'est pour toi <@${authorId}>:\n`;
    if (spy !== null){
        const temp = authorId;
        authorId = spy;
        spy = temp;
    }
    getCoursList(startDate,endDate,authorId).then(coursList => {
        coursList.sort((a, b) => {
            if (a.startDate === b.startDate) {
                return a.startTime.localeCompare(b.startTime);
            }
            return a.startDate.localeCompare(b.startDate);
        });
        let last_day = '';
        coursList.forEach(cours => {
            if(last_day !== cours.getDay()){
                rep += `- **${cours.getDay()}**:\n`;
                last_day = cours.getDay();
            }
            rep += `${tab}- ${cours.title} (${cours.getStartTime()} - ${cours.getEndTime()})\
                    \n\t${cours.description} ${cours.location}\
                    \n\t${cours.type}
                    \n`;
            console.log("rep:", rep);
        });
        if(coursList.length === 0){
            rep = 'Pas de cours aujourd\'hui batard';
        }
        if(mp == 1){
            message.author.send(rep);
        }else{
            message.reply(rep);
        }
    });
}

/**
 * 
 * @param {string} authorId 
 * @returns {ListGroup}
 */
function getGroup(authorId){
    const listGroup = new ListGroup();
    try {
        const data = fs.readFileSync(`src/${authorId}.edt`, 'utf8');
        const lines = data.split('\n');
        for (const line of lines) {
            if (line.trim() === '') continue; // Skip empty lines
            const [ueCode, tdNumber] = line.split(' ');
            console.log(`Loaded group for ${authorId}: UE=${ueCode}, TD=${tdNumber}`);
            const groupObj = new group(ueCode, tdNumber);
            listGroup.addGroup(groupObj);
        }
    } catch (err) {
        console.error(`Error reading file for ${authorId}:`, err);
    }
    return listGroup;
}

function getDate(viewType,spec){
    let specDate = new Date();
    specDate.setHours(specDate.getHours() + 1);
    if(spec != null){
        if(spec.split('/').length == 2){
            const parts = spec.split('/');
            specDate.setDate(Number(parts[0]));
            specDate.setMonth(Number(parts[1]-1));
        }else{
            let mult = 1;
            if(viewType=="week"){mult=7;}
            if(spec.split("+").length == 2){
                const addDay = Number(spec.split("+")[1]) * mult;
                specDate.setDate(specDate.getDate() + addDay);
            }else if(spec.split("-").length == 2){
                const subDay = Number(spec.split('-')[1]) * mult;
                specDate.setDate(specDate.getDate() - subDay);
            }
        } 
            
    }
    const referenceDate = specDate;
    let startDate, endDate;
    
    switch(viewType){
        case "day":
            startDate = referenceDate.toISOString().split('T')[0];
            const endTime = new Date(referenceDate.setDate(referenceDate.getDate() + 1));
            endDate = startDate;
            break;
        case "tomorrow":
            const firstDay = new Date(referenceDate.setDate(referenceDate.getDate() + 1));
            const lastDay = new Date(referenceDate.setDate(firstDay.getDate() + 1));
            startDate = firstDay.toISOString().split('T')[0];
            endDate = startDate;
            break;
        case "week":
            const firstDayOfWeek = new Date(referenceDate.setDate(referenceDate.getDate() - referenceDate.getDay()));
            const lastDayOfWeek = new Date(referenceDate.setDate(firstDayOfWeek.getDate() + 6));
            startDate = firstDayOfWeek.toISOString().split('T')[0];
            endDate = lastDayOfWeek.toISOString().split('T')[0];
            break;
        case "month":
            const firstDayOfMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
            const lastDayOfMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);
            startDate = firstDayOfMonth.toISOString().split('T')[0];
            endDate = lastDayOfMonth.toISOString().split('T')[0];
            break;
        default:
            startDate = referenceDate.toISOString().split('T')[0];
            const end = new Date(referenceDate.setDate(referenceDate.getDate() + 1));
            endDate = end.toISOString().split('T')[0];
            break;
    }
    console.log("startDate:", startDate, "endDate:", endDate);
    return {startDate, endDate};
}

function getCoursList(startDate,endDate,authorId){
    return new Promise((resolve, reject) => {
        let coursList = [];
        const listGroups = getGroup(authorId);
        const celcat = new celcatToJson("https://edt.uvsq.fr/Home/GetCalendarData", viewType.WEEK);
        const promises = [];

        listGroups.groups.keys().forEach(groupCode => {
            const UECodes = listGroups.getUeFromGroupCode(groupCode);
            promises.push(
                // celcat.getCalandarData(startDate,endDate,"103",`M1+Info+gr.+${groupCode}`, "3").then(datacelcat => {
                celcat.getCalandarData(startDate,endDate,"103",`${groupCode}`, "3").then(datacelcat => {
                    const jsonCours = new jsonToCours(datacelcat);
                    jsonCours.getCoursList().forEach(
                        (jsonCours) => {
                            UECodes.forEach(ue => {
                                console.log("checking",jsonCours.title, "for ue", ue);
                                jsonCours.title.forEach(code=>{
                                    if(code.includes(ue)){
                                        coursList.push(jsonCours);
                                    }
                                });
                            });
                        }
                    );

                })
            );
        });
        // Attend que toutes les promesses soient résolues
        Promise.all(promises)
            .then(() => {
                console.log("Voici tes cours :", coursList);
                resolve(coursList);
            })
            .catch(error => {
                reject(error);
            });
    });
}

function writeGroup(authorId, listGroup){
    fs.writeFileSync(`src/${authorId}.edt`, listGroup.getAllGroup());
}

function printEdtDay(authorId,message,spec,spy){
    const {startDate,endDate} = getDate("day",spec);
    printEdt(startDate, endDate, authorId, message,spy);
}
function printEdtWeek(authorId,message,spec,spy){
    const {startDate, endDate} = getDate("week",spec);
    printEdt(startDate, endDate, authorId, message,spy)
}
function printEdtTomorrow(authorId, message,spy){
    const {startDate, endDate} = getDate("tomorrow");
    printEdt(startDate, endDate,authorId, message,spy);
}
function printEdtAt(day,authorId,message,spy){
    const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const currentDate = new Date();
    for(let i = 1; i < days.length()+1; i++){
        if(day == days[i]){
        }
    }
    startDate = currentDate.toISOString().split('T')[0];
    const endTime = new Date(currentDate.setDate(currentDate.getDate() + 1));
    endDate = endTime.toISOString().split('T')[0];
    printEdt(startDate, endDate, authorId, message,spy);
}

function help(){
    let rep = 'commande du bot edt:\n';
    rep += '- edt group add {codeUe} {num_TD}\n\texemple:edt group add MSANGS2I 1\n\tajoute l\'UE anglais td 1 à votre emploi du temps\n';
    rep += '- edt group remove {codeUe} {num_TD}\n\texemple:edt group add MSANGS2I 1\n\tsuprime l\'UE anglais td 1 à votre emploi du temps\n';
    rep += '- edt {jour,semaine,demain} [+(num),-(num),01/01]\n\trenvoie votre emplois du temps de la semaine actuelle\n';
    rep += `${tab}- +(num) ajoute le nombre de jour ou de semaine à la date actuelle\n`;
    rep += `${tab}- -(num) enleve le nombre de jour ou de semaine à la date actuelle\n`;
    rep += `${tab}- (jour)/(moi) affiche l'emploi du temps part rapport à la date donnee\n`;
    rep += '- pour afficher ce message\n\t{help,?}\n';
    return rep;
}

function helpSpy(){
    let rep = 'Commande spy:';
    rep += '- spy @userTag jour:\n\tdonne l\'emploi du temps de l\'utilisateur';
    rep += '- spy @userTag semaine +1:\n\tdonne l\'emploi du temps de la semaine de l\'utilisateur';
}

module.exports = {parseEdt,help};