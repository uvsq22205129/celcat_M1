const Cours = require("./cours.js");

class jsonToCours {
    /**
     * 
     * @param {object} jsonData 
     */
    constructor(jsonData) {
        this.data = jsonData;
    }
    parseVal(key) {
        const keys = Object.keys(this.data);
        if (keys.indexOf(key) !== -1){
            return this.data[key];
        }else{
            return '';
        }
    }
    
    parseCours(){
        const title = this.parseVal('modules');
        const startTime = this.parseVal('start').toString();
        const endTime = this.parseVal('end').toString();
        const location = this.parseVal('sites');
        const description = this.parseVal('description').split('-')[0];
        const salle = description.slice(description.lastIndexOf('\n') + 1);
        const type = this.parseVal('eventCategory');
        const cours = new Cours(title, startTime, endTime, location, salle, type);
        return cours;

    }
    getCoursList(){
        const coursArray = [];
        for (let i = 0; i < this.data.length; i++){
            const jsonCours = this.data[i];
            const jsonToCoursInstance = new jsonToCours(jsonCours);
            const cours = jsonToCoursInstance.parseCours();
            coursArray.push(cours);
        }
        return coursArray;
    }
}

module.exports = jsonToCours;