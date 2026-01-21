const group = require("./group")
const ListGroup = require("./listGroup");
const fs = require('fs');
const celcatToJson = require('./celcatToJson');
const jsonToCours = require('./jsonToCours');
const viewType = require('./viewType');
const { resolve } = require("dns");

/**
 * 
 * @param {string} data 
 * @param {ListGroup} listAuthor 
 */
function parseEdt(data,authorTag,message){
    console.log(data);
    if (data.toLowerCase().startsWith("edt")){
        const parts = data.split(' ');
        if (parts[1] == "group" && parts.length >= 5){
            return groupParse(parts.slice(2),authorTag);
        }
        else if (parts[1] == "jour" || parts[1] == "day"){
            printEdtDay(authorTag, message);
        }
        else if (parts[1] == "week" || parts[1] == "semaine"){
            printEdtWeek(authorTag, message);
        }else if (parts[1] == "tomorrow" || parts[1] == "demain"){
            printEdtTomorrow(authorTag, message);
        }
    }else if(data.toLowerCase().startsWith('help') || data.toLowerCase().startsWith('?')){
        message.channel.send(help());
    }
}
/**
 * use when command is "edt group add UEcode Td_number"
 * or when command is "edt group remove UEcode Td_number"
 * @param {[string]} data 
 * @param {string} authorTag 
 */
function groupParse(data,authorTag){
    if (data[0] == "add"){
        console.log("add group");
        const groupToAdd = new group(data[1],data[2]);
        let list_group = getGroup(authorTag);
        list_group.addGroup(groupToAdd);
        writeGroup(authorTag,list_group)
        console.log(authorTag, data[1], data[2]);
        return `group ${data[1]} ${data[2]} added`;
    }else if (data[0] == "remove"){
        console.log("remove group");
        const groupToRemove = new group(data[1],data[2]);
        let list_group = getGroup(authorTag);
        list_group.removeGroup(groupToRemove);
        writeGroup(authorTag,list_group);
        return `group ${data[1]} ${data[2]} removed`;
    }
}

function printEdt(startDate, endDate, authorTag,message){
    let rep = `EDT for ${authorTag}:\n`;
    getCoursList(startDate,endDate,authorTag).then(coursList => {
        coursList.sort((a, b) => {
            if (a.startDate === b.startDate) {
                return a.startTime.localeCompare(b.startTime);
            }
            return a.startDate.localeCompare(b.startDate);
        });
        let last_day = '';
        coursList.forEach(cours => {
            if(last_day !== cours.getDay()){
                rep += `- ${cours.getDay()}:\n`;
                last_day = cours.getDay();
            }
            rep += `\t- ${cours.title} (${cours.getStartTime()} - ${cours.getEndTime()})\
                    \n\t\t${cours.description} ${cours.location}\
                    \n\t\t${cours.type}
                    \n`;
            console.log("rep:", rep);
        });
        message.reply(rep);
    });
}

/**
 * 
 * @param {string} authorTag 
 * @returns {ListGroup}
 */
function getGroup(authorTag){
    const listGroup = new ListGroup();
    try {
        const data = fs.readFileSync(`src/${authorTag}.edt`, 'utf8');
        const lines = data.split('\n');
        for (const line of lines) {
            if (line.trim() === '') continue; // Skip empty lines
            const [ueCode, tdNumber] = line.split(' ');
            console.log(`Loaded group for ${authorTag}: UE=${ueCode}, TD=${tdNumber}`);
            const groupObj = new group(ueCode, tdNumber);
            listGroup.addGroup(groupObj);
        }
    } catch (err) {
        console.error(`Error reading file for ${authorTag}:`, err);
    }
    return listGroup;
}

function getDate(viewType){
    const currentDate = new Date();
    let startDate, endDate;
    switch(viewType){
        case "day":
            startDate = currentDate.toISOString().split('T')[0];
            const endTime = new Date(currentDate.setDate(currentDate.getDate() + 1));
            // endDate = endTime.toISOString().split('T')[0];
            endDate = startDate;
            break;
        case "tomorrow":
            const firstDay = new Date(currentDate.setDate(currentDate.getDate() + 1));
            const lastDay = new Date(currentDate.setDate(firstDay.getDate() + 1));
            startDate = firstDay.toISOString().split('T')[0];
            endDate = startDate;
            break;
        case "week":
            const firstDayOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
            const lastDayOfWeek = new Date(currentDate.setDate(firstDayOfWeek.getDate() + 6));
            startDate = firstDayOfWeek.toISOString().split('T')[0];
            endDate = lastDayOfWeek.toISOString().split('T')[0];
            break;
        case "month":
            const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            startDate = firstDayOfMonth.toISOString().split('T')[0];
            endDate = lastDayOfMonth.toISOString().split('T')[0];
            break;
        default:
            startDate = currentDate.toISOString().split('T')[0];
            const end = new Date(currentDate.setDate(currentDate.getDate() + 1));
            endDate = end.toISOString().split('T')[0];
            break;
    }
    console.log("startDate:", startDate, "endDate:", endDate);
    return {startDate, endDate};
}

function getCoursList(startDate,endDate,authorTag){
    return new Promise((resolve, reject) => {
        let coursList = [];
        const listGroups = getGroup(authorTag);
        const celcat = new celcatToJson("https://edt.uvsq.fr/Home/GetCalendarData", viewType.WEEK);
        const promises = [];

        listGroups.groups.keys().forEach(groupCode => {
            const UECodes = listGroups.getUeFromGroupCode(groupCode);
            promises.push(
                celcat.getCalandarData(startDate,endDate,"103",`M1+Info+gr.+${groupCode}`, "3").then(datacelcat => {
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

function writeGroup(authorTag, listGroup){
    fs.writeFileSync(`src/${authorTag}.edt`, listGroup.getAllGroup());
}

function printEdtDay(authorTag,message){
    const {startDate,endDate} = getDate("day");
    printEdt(startDate, endDate, authorTag, message);
}
function printEdtWeek(authorTag,message){
    const {startDate, endDate} = getDate("week");
    printEdt(startDate, endDate, authorTag, message)
}
function printEdtTomorrow(authorTag, message){
    const {startDate, endDate} = getDate("tomorrow");
    printEdt(startDate, endDate,authorTag, message);
}
function printEdtAt(day,authorTag,message){
    const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const currentDate = new Date();
    for(let i = 1; i < days.length()+1; i++){
        if(day == days[i]){
        }
    }
    startDate = currentDate.toISOString().split('T')[0];
    const endTime = new Date(currentDate.setDate(currentDate.getDate() + 1));
    endDate = endTime.toISOString().split('T')[0];
    printEdt(startDate, endDate, authorTag, message);
}

function help(){
    let rep = 'commande du bot edt:\n';
    rep += '- edt group add {codeUe} {num_TD}\n\texemple:edt group add MSANGS2I 1\n\tajoute l\'UE anglais td 1 à votre emploi du temps\n';
    rep += '- edt group remove {codeUe} {num_TD}\n\texemple:edt group add MSANGS2I 1\n\tsuprime l\'UE anglais td 1 à votre emploi du temps\n';
    rep += '- edt {jour,semaine,demain}\n\trenvoie votre emplois du temps de la semaine actuelle\n';
    rep += '- pour afficher ce message\n\t{help,?}\n';
    return rep;
}

module.exports = {parseEdt,help};