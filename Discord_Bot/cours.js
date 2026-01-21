class Cours{
	/**
	 * @property {string} title
	 * @property {string} startTime
	 * @property {string} endTime
	 * @property {string} location
	 * @property {string} description
	 * @property {string} type
	 * */
	constructor(title, startTime, endTime, location, description, type){
		this.title = title;
		this.startTime = startTime;
		this.endTime = endTime;
		this.description = description;
		this.type = type;
		this.location = location;
	}

	/**
	 * @return {number} - durée en minutes
	 * */
	getDurationInMinutes(){
		const start = new Date(this.startTime);
		const end = new Date(this.endTime);
		const durationInMs = end - start;
		return durationInMs / (1000 * 60);
	}

	getDay(){
		const days = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
		const date = new Date(this.startTime);
		let month = date.getMonth() + 1;
		if (month < 10){month = '0'+month.toString();}
		let num_day = date.getDate();
		if (num_day < 10){num_day = '0' + num_day.toString()}
		const day = date.getDay();
		return `${days[day]}(${num_day}/${month})`;
	}

	getStartTime(){
		const start = this.startTime.split('T')[1].split(':');
		return `${start[0]}h${start[1]}`;
	}

	getEndTime(){
		const end = this.endTime.split('T')[1].split(':');
		return `${end[0]}h${end[1]}`;
	}
}
module.exports = Cours;