const group = require('./group');
const ListGroup = require('./listGroup');
const fs = require('fs');

class ManageGroup{
    constructor(userid){
        this.userid = userid;
        this.groups = this.getGroup(userid);
    }

    getGroup(userid){
        const listGroup = new ListGroup();
        try {
            const data = fs.readFileSync(`src/${userid}.edt`, 'utf8');
            const lines = data.split('\n');
            for (const line of lines) {
                if (line.trim() === '') continue; // Skip empty lines
                const [ueCode, tdNumber] = line.split(' ');
                console.log(`Loaded group for ${userid}: UE=${ueCode}, TD=${tdNumber}`);
                const groupObj = new group(ueCode, tdNumber);
                listGroup.addGroup(groupObj);
            }
        } catch (err) {
            console.error(`Error reading file for ${userid}:`, err);
        }
        return listGroup;
    }

    addGroup(UEcode, group_td){
        const groupToAdd = new group(UEcode, group_td);
        this.groups.addGroup(groupToAdd);
        this.writeGroup();
    }

    removeGroup(UEcode, group_td){
        const groupToRemove = new group(UEcode, group_td);
        this.groups.removeGroup(groupToRemove);
        this.writeGroup();
    }

    writeGroup(){
        fs.writeFileSync(`src/${this.userid}.edt`, this.groups.getAllGroup());
    }

    getList(){
        return this.groups.toListGroup();
    }

}

module.exports = {ManageGroup};