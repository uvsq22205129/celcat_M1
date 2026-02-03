const group = require("./group")
class ListGroup{
    /**
     * @property {Map<string, [group]>} groups
     */
    constructor(){
        this.groups = new Map();
    }
    /**
     * 
     * @param {group} groupToAdd 
     */
    addGroup(groupToAdd){
        if (!this.groups.has(groupToAdd.groupCode)){
            this.groups.set(groupToAdd.groupCode,[groupToAdd.UECode]);
        }else{
            const ueList = this.groups.get(groupToAdd.groupCode);
            if(!ueList.includes(groupToAdd.UECode)){
                this.groups.get(groupToAdd.groupCode).push(groupToAdd.UECode);
            }
        }
    }

    /**
     * 
     * @param {group} groupToRemove
     */
    removeGroup(groupToRemove){
        if (this.groups.has(groupToRemove.groupCode)){
            this.groups.set(groupToRemove.groupCode, this.groups.get(groupToRemove.groupCode).filter(ue => ue != groupToRemove.UECode));
            if (this.groups.get(groupToRemove.groupCode).length == 0)
            this.groups.delete(groupToRemove.groupCode);
        }
    }

    getAllGroup(){
        let rep = '';
        console.log(this.groups.entries());
        this.groups.entries().forEach(l_groups =>{
            l_groups[1].forEach(group => {
                rep += `${group} ${l_groups[0]}\n`;
            });
        });
        return rep;
    }

    toListGroup(){
        let rep = [];
        this.groups.entries().forEach(l_groups =>{
            l_groups[1].entries().forEach(UE =>{
                rep.push(new group(UE[1],l_groups[0]));
            });
        });
        return rep;
    }

    getUeFromGroupCode(groupCode){
        return this.groups.get(groupCode);
    }
}

module.exports = ListGroup;