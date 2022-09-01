let canvas = document.getElementById("crossroads"),
	ctx = canvas.getContext('2d'),
	indent_X = 50,
	indent_Y = 30,
	CoordStreamsX = [canvas.width/2 + 2*canvas.height/32+ 100, canvas.width/2 - 2*canvas.height/32 - 100, 195, canvas.width -  4*canvas.height/16],
	CoordStreamsY = [canvas.height-95, 95, canvas.height/2 + 50,canvas.height/2 - 50];
	DirectionsStreams = [0,180,270,90],
	boolTimer = true;

	let times = 30;

class Car{
	constructor(x,y,direction,futDir){
		this.x = x;
		this.y = y;
		this.aX = 0;
		this.aY = 0;
		this.nX = this.x;
		this.nY = this.y;
		this.direction = direction;
		if(futDir >0.4) this.futureDirection = 0; // 0 - прямо, 1 - направо, 2 - налево
		else this.futureDirection = 1;
		this.angleRotation = direction;
		this.speedX = this.aX;
		this.speedY = this.aY;
		this.stateOfMotion = false;
	}

	print(){
		ctx.save();
		ctx.translate(this.nX,this.nY);
		ctx.rotate(this.angleRotation*Math.PI/180);
		ctx.beginPath();
		ctx.arc(0,0,5,0,2*Math.PI,0);
		ctx.fillStyle = 'black';
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.strokeRect(-35,-75,70,150);
		ctx.stroke();
		ctx.restore();
	}

	stuporBeforeStart(delayPreviousOnes){
		return delayPreviousOnes + Math.random();
	}

	decelerationCalculation(Sx, Sy){
		this.aX = Math.abs(this.speedX*this.speedX/(2*(Sx+0.0000001))*Math.round(Math.sin(this.direction/180*Math.PI)));
		this.aY = Math.abs(this.speedY*this.speedY/(2*(Sy+0.0000001))*Math.round(Math.cos(this.direction/180*Math.PI)));
	}

	checkStopConditions(coordTL_x, coordTL_y, phaseTime,phase){
		if(((!(Math.abs(coordTL_x-(this.nX - 75*Math.round(Math.sin(this.direction/180*3.14))))/(60*(this.speedX+0.000001))<Math.abs(phaseTime) 
			|| Math.abs(coordTL_y-(this.nY-75*Math.round(Math.cos(this.direction/180*3.14))))/(60*(this.speedY+0.000001))<Math.abs(phaseTime))) || phase != 2)
		 && Math.abs(coordTL_x+Math.round(Math.sin(this.direction/180*3.14))*400-(this.nX - 75*Math.round(Math.sin(this.direction/180*3.14)))) < 400 
		 && Math.abs(coordTL_y+Math.round(Math.cos(this.direction/180*3.14))*400-(this.nY-75*Math.round(Math.cos(this.direction/180*3.14)))) < 400){
			return true;
		}
		else  { return false;}
	}


	processTurningRight(){
		this.nY = this.y - Math.sin((this.angleRotation)/180*3.14)*120 +120*Math.sin(this.direction/180*3.14);
		this.nX = this.x - Math.cos((this.angleRotation)/180*3.14)*120 +120*Math.cos(this.direction/180*3.14);
		this.angleRotation+=1;
		if(this.angleRotation %90 == 0){ 
			this.direction=this.angleRotation;
			this.futureDirection = 0;
			this.y = this.nY;
			this.x = this.nX;
			this.speedX = 1.2*Math.abs(Math.round(Math.sin(this.direction/180*Math.PI)));
			this.speedY = 1.2*Math.abs(Math.round(Math.cos(this.direction/180*Math.PI)));
		}
	}

	processTurningLeft(){
		this.nY = this.y - Math.sin((this.angleRotation)/180*3.14)*320 + 320*Math.sin(this.direction/180*3.14);
		this.nX = this.x - Math.cos((this.angleRotation)/180*3.14)*320 + 320*Math.cos(this.direction/180*3.14);
		this.angleRotation-=0.5;
		if(this.angleRotation %90 == 0){ 
			this.direction=this.angleRotation;
			this.futureDirection = 0;
		}
	}

	processMovingStraight(){
		this.stateOfMotion = true;
		this.nY -= this.speedY *Math.round(Math.cos(this.direction/180*Math.PI));
		this.nX += this.speedX *Math.round(Math.sin((this.direction)/180*Math.PI));
		this.y -= this.speedY *Math.round(Math.cos(this.direction/180*Math.PI));
		this.x -= this.speedX *Math.round(Math.sin(this.direction/180*Math.PI));
		if(this.speedX <= 2 && this.speedY <= 2){  //Проверить нужно ли это дело
			this.speedY+=0.04*Math.abs(Math.round(Math.cos(this.direction/180*Math.PI)));
			this.speedX+=0.04*Math.abs(Math.round(Math.sin(this.direction/180*Math.PI)));
		}
	}

	processMovingStraightFA(){
		this.stateOfMotion = true;
		this.nY -= this.speedY *Math.round(Math.cos(this.direction/180*Math.PI));
		this.nX -= this.speedX *Math.round(Math.sin((this.direction)/180*Math.PI));
		this.y -= this.speedY *Math.round(Math.cos(this.direction/180*Math.PI));
		this.x -= this.speedX *Math.round(Math.sin(this.direction/180*Math.PI));
		if(this.speedX <= 2 && this.speedY <= 2){  //Проверить нужно ли это дело
			this.speedY+=0.04*Math.abs(Math.round(Math.cos(this.direction/180*Math.PI)));
			this.speedX+=0.04*Math.abs(Math.round(Math.sin(this.direction/180*Math.PI)));
		}
	}

	processSmoothStop(coordTL_x, coordTL_y){
		if(this.stateOfMotion == true){
			this.stateOfMotion = false;
			this.decelerationCalculation(Math.abs(coordTL_x+Math.round(Math.sin(this.direction/180*Math.PI))*400-(this.nX-75*Math.round(Math.sin(this.direction/180*3.14)))),
				Math.abs(coordTL_y+Math.round(Math.cos(this.direction/180*Math.PI))*400-(this.nY-75*Math.round(Math.cos(this.direction/180*3.14)))));
		}
		this.nY -= this.speedY*Math.round(Math.cos(this.direction/180*Math.PI));
		this.nX -= this.speedX*Math.round(Math.sin(this.direction/180*Math.PI));
		this.y -= this.speedY *Math.round(Math.cos(this.direction/180*Math.PI));
		this.x -= this.speedX *Math.round(Math.sin(this.direction/180*Math.PI));
		if(!(this.speedY <= this.aY && this.speedX <= this.aX)){
			this.speedY-=this.aY;
			this.speedX-=this.aX;
		}
		else{
			this.speedY = 0;
			this.speedX = 0;
		}
	}
}


class trafficLights{
	constructor(x,y,angle,phase,phaseTime){
		this.x = x,
		this.y = y,
		this.angle = angle,
		this.radius = 13;
		this.phase = phase;
		this.previousPhase = this.phase;
		this.nextPhase = Math.pow((-1),(Math.trunc((this.phase)/2)))*2;
		this.phaseTime = phaseTime;
	} 
	print(){
		let colorTL = ['red','yellow','green'];
		ctx.save();
		ctx.translate(this.x,this.y);
		ctx.rotate(this.angle*Math.PI/180);
		ctx.beginPath();
		ctx.strokeRect(0,0,40,100);
		ctx.stroke();

		for(let i = 0; i<3; i++){
			ctx.beginPath();
			ctx.arc(20,20+i*30,this.radius,0,2*Math.PI,0);
			ctx.fillStyle = 'gray';
			ctx.fill();
			ctx.stroke();
		}
		ctx.beginPath();
		ctx.arc(20,20+this.phase*30,this.radius,0,2*Math.PI,0);
		ctx.fillStyle = colorTL[this.phase];
		ctx.fill();
		if(this.phase != 1){
			ctx.font = '18px serif';
			ctx.fillStyle = 'white';
			if(this.phaseTime>9)
				ctx.fillText(this.phaseTime,20-9,50+5);
			else
				ctx.fillText(this.phaseTime,20-4,50+5)
		}
		if(this.previousPhase == 0 && this.phaseTime <=2){
			ctx.beginPath();
			ctx.arc(20,20,this.radius,0,2*Math.PI,0);
			ctx.fillStyle = colorTL[this.previousPhase];
			ctx.fill();
		}
		if(this.phase == 2 && this.phaseTime <=3 && this.phaseTime%2 == 1){
			ctx.beginPath();
			ctx.arc(20,20+this.phase*30,this.radius,0,2*Math.PI,0);
			ctx.fillStyle = 'gray';
			ctx.fill();
			ctx.stroke();
		}
		ctx.stroke();
		ctx.restore();
	}
	timeChange(){
		switch(this.phaseTime){
			case 1:
				this.phase = 1;
				break;
			case -2:
				this.phase = this.nextPhase;
				[this.previousPhase,this.nextPhase] = [this.nextPhase,this.previousPhase];
				if(this.phase == 0) this.phaseTime = 60- times +1;
				else this.phaseTime = times+1;
				break;	
		}
		this.phaseTime--;
	}
	timeChangeBlack(){
		switch(this.phaseTime){
			case 1:
				this.phase = 1;
				break;
			case -2:
				this.phase = this.nextPhase;
				[this.previousPhase,this.nextPhase] = [this.nextPhase,this.previousPhase];
				if(this.phase == 0) this.phaseTime = times+1;
				else this.phaseTime =60 - times +1;
				break;	
		}
		this.phaseTime--;
	}
}

class trafficLightsDemo{
	constructor(x,y,angle,phase,phaseTime){
		this.x = x,
		this.y = y,
		this.angle = angle,
		this.radius = 13;
		this.phase = phase;
		this.previousPhase = this.phase;
		this.nextPhase = Math.pow((-1),(Math.trunc((this.phase)/2)))*2;
		this.phaseTime = phaseTime;

	} 
	print(){
		let colorTL = ['red','yellow','green'];
		ctx.save();
		ctx.translate(this.x,this.y);
		ctx.rotate(this.angle*Math.PI/180);
		ctx.beginPath();
		ctx.strokeRect(0,0,40,100);
		ctx.stroke();

		for(let i = 0; i<3; i++){
			ctx.beginPath();
			ctx.arc(20,20+i*30,this.radius,0,2*Math.PI,0);
			ctx.fillStyle = 'gray';
			ctx.fill();
			ctx.stroke();
		}

		ctx.beginPath();
		ctx.strokeRect(-40,60,40,40);
		ctx.stroke();

		ctx.beginPath();
		ctx.strokeRect(40,60,40,40);
		ctx.stroke();


		ctx.beginPath();
		ctx.arc(-20,20+2*30,this.radius,0,2*Math.PI,0);
		ctx.fillStyle = 'gray';
		ctx.fill();
		ctx.stroke();

		ctx.beginPath();
		ctx.arc(60,20+2*30,this.radius,0,2*Math.PI,0);
		ctx.fillStyle = 'gray';
		ctx.fill();
		ctx.stroke();

		ctx.beginPath();
		ctx.arc(20,20+this.phase*30,this.radius,0,2*Math.PI,0);
		ctx.fillStyle = colorTL[this.phase];
		ctx.fill();
		if(this.phase != 1){
			ctx.font = '18px serif';
			ctx.fillStyle = 'white';
			if(this.phaseTime>9)
				ctx.fillText(this.phaseTime,20-9,50+5);
			else
				ctx.fillText(this.phaseTime,20-4,50+5)
		}
		if(this.previousPhase == 0 && this.phaseTime <=2){
			ctx.beginPath();
			ctx.arc(20,20,this.radius,0,2*Math.PI,0);
			ctx.fillStyle = colorTL[this.previousPhase];
			ctx.fill();
		}
		if(this.phase == 2 && this.phaseTime <=3 && this.phaseTime%2 == 1){
			ctx.beginPath();
			ctx.arc(20,20+this.phase*30,this.radius,0,2*Math.PI,0);
			ctx.fillStyle = 'gray';
			ctx.fill();
			ctx.stroke();
		}
		ctx.stroke();
		ctx.restore();
	}
	timeChange(){
		switch(this.phaseTime){
			case 1:
				this.phase = 1;
				break;
			case -2:
				this.phase = this.nextPhase;
				[this.previousPhase,this.nextPhase] = [this.nextPhase,this.previousPhase];
				this.phaseTime = 31;
				break;	
		}
		this.phaseTime--;
	}
}


/*
	Нечёткая логика
	Матрица правил
*/
// Номер строки - терм-множеств времени|| 0 - мало, 1 - среднее, 2 - много
// Номер столбца - терм-множество направлений|| 0 - малое, 1 - среднее, 2 большое
// Значения матрицы - терм-множество выходной переменной || 0 - уменьшить, 1 - не изменять, 2 увеличить
let RuleTable = [[1,2,2],
				 [0,1,2],
				 [0,0,1]];
let fuzzyTimeChange = [0,0,0];
function fuzzyfication(TLtime, CountCars){
	let v = [0,0,0];
	if(CountCars < 25){
		if(CountCars < 20) v[0] = 1;
		else v[0] = (25- CountCars)/5;
	}
	if(CountCars >20 && CountCars<40 ){
		if(CountCars < 25) v[1] = (CountCars - 20)/5;
		if(CountCars >= 25 && CountCars <= 35) v[1] = 1;
		if(CountCars > 35) v[1] = (40- CountCars)/5;
	}
	if(CountCars >35){
		if(CountCars <40) v[2] = (CountCars - 35)/5;
		if(CountCars >= 40) v[2] = 1;
	}

	let t = [0,0,0];
	if(TLtime < 25){
		if(TLtime < 20) t[0] = 1;
		else t[0] = (25- TLtime)/5;
	}
	if(TLtime >20 && TLtime<40 ){
		if(TLtime < 25) t[1] = (TLtime - 20)/5;
		if(TLtime >= 25 && TLtime <= 35) t[1] = 1;
		if(TLtime > 35) t[1] = (40- TLtime)/5;
	}
	if(TLtime >35){
		if(TLtime <40) t[2] = (TLtime - 35)/5;
		if(TLtime >= 40) t[2] = 1;
	}

	for(let i = 0; i<3;i++){
		for(let j =0; j<3; j++){
			if(Math.min(v[j],t[i]) != 0) fuzzyTimeChange[RuleTable[i][j]] = Math.min(v[j],t[i]);
		}
	}
	console.log(fuzzyTimeChange[0],fuzzyTimeChange[1],fuzzyTimeChange[2]);
}

function downFZn(a,b,x){
	return (-1)*Math.pow((b-x),2)/(2*(b-a));
}

function upFZn(a,b,x){
	return Math.pow((x-a),2)/(2*(b-a));
}

function upF(a,b,x){
	return (Math.pow(x,3)/3 - a*Math.pow(x,2)/2)/(b-a);
}
function downF(a,b,x){
	return (b*Math.pow(x,2)/2 - Math.pow(x,3)/3)/(b-a);
}
function findXUpF(a,b,mu){
	return mu*(b-a) + a;
}
function findXDownF(a,b,mu){
	return b - mu*(b-a);
}


function defuzzyfication(){
	let nTime = 0;
	let cmp = 0;
	if(fuzzyTimeChange[0] > 0 ){
		if(fuzzyTimeChange[0] > fuzzyTimeChange[1]){
			nTime += (Math.pow(findXDownF(-10,0,fuzzyTimeChange[0]),2) - Math.pow(-20,2))/2;
			cmp += findXDownF(-10,0,fuzzyTimeChange[0]) + 20;
			nTime += downF(-10,0, findXUpF(-10,0,fuzzyTimeChange[1])) - downF(-10,0,findXDownF(-10,0,fuzzyTimeChange[0]));
			cmp += downFZn(-10,0, findXUpF(-10,0,fuzzyTimeChange[1])) - downFZn(-10,0,findXDownF(-10,0,fuzzyTimeChange[0]));
		}
		else{
			nTime +=(Math.pow(findXUpF(-10,0,fuzzyTimeChange[1]),2) - Math.pow(-20,2))/2;
			cmp += findXUpF(-10,0,fuzzyTimeChange[1]) + 20;
			nTime += upF(-10,0, findXUpF(-10,0,fuzzyTimeChange[1])) - upF(-10,0,findXDownF(-10,0,fuzzyTimeChange[0]));
			cmp += upFZn(-10,0, findXUpF(-10,0,fuzzyTimeChange[1])) - upFZn(-10,0,findXDownF(-10,0,fuzzyTimeChange[0]));
		}
		nTime += ((Math.pow(findXDownF(5,10,fuzzyTimeChange[1]),2)) - Math.pow(findXUpF(-10,0,fuzzyTimeChange[1]),2))/2;
		nTime += downF(5,10,10) - downF(5,10,findXDownF(5,10,fuzzyTimeChange[1]));


		cmp += findXDownF(5,10,fuzzyTimeChange[1]) - findXUpF(-10,0,fuzzyTimeChange[1]);
		cmp += downFZn(5,10,10) - downFZn(5,10,findXDownF(5,10,fuzzyTimeChange[1]));

		nTime = Math.round(nTime/cmp);
		console.log(nTime);
		return nTime;
	}
	if(fuzzyTimeChange[1] > 0){
		nTime += upF(-10,0,findXUpF(-10,0,fuzzyTimeChange[1])) - upF(-10,0,0);
		cmp += upFZn(-10,0,findXUpF(-10,0,fuzzyTimeChange[1])) - upF(-10,0,0);
		if(fuzzyTimeChange[1] > fuzzyTimeChange[2]){
			nTime += ((Math.pow(findXDownF(5,10,fuzzyTimeChange[1]),2)) - Math.pow(findXUpF(-10,0,fuzzyTimeChange[1]),2))/2;
			cmp += findXDownF(5,10,fuzzyTimeChange[1]) - findXUpF(-10,0,fuzzyTimeChange[1]);

			nTime += downF(5,10,findXUpF(5,10,fuzzyTimeChange[2])) - downF(5,10,findXDownF(5,10,fuzzyTimeChange[1]));
			cmp += downFZn(5,10,findXUpF(5,10,fuzzyTimeChange[2])) - downFZn(5,10,findXDownF(5,10,fuzzyTimeChange[1]));

		}
		else{
			nTime += ((Math.pow(findXUpF(5,10,fuzzyTimeChange[1]),2)) - Math.pow(findXUpF(-10,0,fuzzyTimeChange[1]),2))/2;
			cmp += findXUpF(5,10,fuzzyTimeChange[1]) - findXUpF(-10,0,fuzzyTimeChange[1]);

			nTime += upF(5,10,findXUpF(5,10,fuzzyTimeChange[2])) - upF(5,10,findXUpF(5,10,fuzzyTimeChange[1]));
			cmp += upFZn(5,10,findXUpF(5,10,fuzzyTimeChange[2])) - upFZn(5,10,findXUpF(5,10,fuzzyTimeChange[1]));
		}
		nTime += ((Math.pow(20,2)) - Math.pow(findXUpF(5,10,fuzzyTimeChange[2]),2))/2;
		cmp += 20 - findXUpF(5,10,fuzzyTimeChange[2]);
		nTime = Math.round(nTime/cmp);
		console.log(nTime);
		return nTime;

	}
	if(fuzzyTimeChange[2] > 0){
		nTime += upF(5,10,findXUpF(5,10,fuzzyTimeChange[2])) - upF(5,10,5);
		cmp += upFZn(5,10,findXUpF(5,10,fuzzyTimeChange[2])) - upFZn(5,10,5);

		nTime += (Math.pow(20,2) - Math.pow(findXUpF(5,10,fuzzyTimeChange[2]),2))/2;
		cmp += 20 - findXUpF(5,10,fuzzyTimeChange[2]);

		nTime = Math.round(nTime/cmp);
		console.log(nTime);
		return nTime;
	}
}




let TlightsDemo = new trafficLightsDemo(canvas.width-240,canvas.height-170,0,0,5);

let T_lights = [];
	T_lights[0] = new trafficLights(canvas.width-270,canvas.height-170,0,0,5);
	T_lights[1] = new trafficLights(270,170,180,0,5);
	T_lights[2] = new trafficLights(270,canvas.height-170,90,0,45+3);
	T_lights[3] = new trafficLights(canvas.width-270,170,270,0,45+3);


function creatingStream(CoordX,CoordY,direction,counts){
	let Stream = [];
	for(let i = 0; i<counts; i++){
		let rand = Math.random();
		Stream.push(new Car(CoordX + 180*i*Math.round(Math.sin(direction/180*Math.PI)),CoordY+180*i*Math.round(Math.cos(direction/180*Math.PI)),direction,rand));
	}
	return Stream;
}




function printInform(Tx,Ty,direction,k, i){
	ctx.save();
	ctx.beginPath();
	ctx.translate(Tx+100*Math.round(Math.cos(direction/180*Math.PI)),Ty+100*Math.round(Math.sin(direction/180*Math.PI)));
	ctx.rotate(direction*Math.PI/180);
	ctx.strokeRect(0,0,50,70);
	ctx.font = '18px serif';
	ctx.fillStyle = 'black';
	ctx.fillText("П: "+ k, 5,20);
	ctx.fillText("О: "+ i, 5, 40);
	ctx.restore();
	ctx.stroke();
}

function drawCrossroads(){
	ctx.beginPath();

	ctx.moveTo(300,indent_Y);
	ctx.lineTo(300, 150);
	ctx.moveTo(indent_X,canvas.height/4);
	ctx.lineTo(250,canvas.height/4);
	ctx.moveTo(300,150);
	ctx.quadraticCurveTo(300, canvas.height/4, 250, canvas.height/4);

	ctx.moveTo(300,canvas.height-indent_Y);
	ctx.lineTo(300,3*canvas.height/4+50);
	ctx.moveTo(indent_X,3*canvas.height/4);
	ctx.lineTo(250,3*canvas.height/4);
	ctx.moveTo(300,3*canvas.height/4+50);
	ctx.quadraticCurveTo(300, 3*canvas.height/4, 250,3*canvas.height/4);

	ctx.moveTo(canvas.width-300,indent_Y);
	ctx.lineTo(canvas.width-300, 150);
	ctx.moveTo(canvas.width-indent_X,canvas.height/4);
	ctx.lineTo(canvas.width-250,canvas.height/4);
	ctx.moveTo(canvas.width-300,150);
	ctx.quadraticCurveTo(canvas.width-300, canvas.height/4, canvas.width-250, canvas.height/4);

	ctx.moveTo(canvas.width-300,canvas.height-indent_Y);
	ctx.lineTo(canvas.width-300,canvas.height-150);
	ctx.moveTo(canvas.width-indent_X,canvas.height-200);
	ctx.lineTo(canvas.width-250,canvas.height-200);
	ctx.moveTo(canvas.width-300,canvas.height-150);
	ctx.quadraticCurveTo(canvas.width-300, canvas.height-200, canvas.width-250, canvas.height-200);

	ctx.moveTo(canvas.width/2,indent_Y);
	ctx.lineTo(canvas.width/2,200);
	ctx.moveTo(canvas.width/2,canvas.height-200);
	ctx.lineTo(canvas.width/2,canvas.height-indent_Y);

	ctx.moveTo(indent_X,canvas.height/2);
	ctx.lineTo(300,canvas.height/2);
	ctx.moveTo(canvas.width-300,canvas.height/2);
	ctx.lineTo(canvas.width-indent_X,canvas.height/2);

	let cmp = indent_X;
	while(cmp<300){
		ctx.moveTo(cmp,3*canvas.height/8);
		ctx.lineTo(cmp+45,3*canvas.height/8);
		ctx.moveTo(cmp,5*canvas.height/8);
		ctx.lineTo(cmp+45,5*canvas.height/8);
		cmp+=65;
	}
	cmp = canvas.width-indent_X;
	while(cmp>canvas.width-300){
		ctx.moveTo(cmp,3*canvas.height/8);
		ctx.lineTo(cmp-45,3*canvas.height/8);
		ctx.moveTo(cmp,5*canvas.height/8);
		ctx.lineTo(cmp-45,5*canvas.height/8);
		cmp-=65;
	}
	cmp = indent_Y;
	while(cmp<canvas.height/4){
		ctx.moveTo(canvas.width/2 - canvas.height/8,cmp);
		ctx.lineTo(canvas.width/2 - canvas.height/8,cmp+45);
		ctx.moveTo(canvas.width/2 + canvas.height/8,cmp);
		ctx.lineTo(canvas.width/2 + canvas.height/8,cmp+45);
		cmp+=65;
	}
	cmp = canvas.height - indent_Y;
	while(cmp>3*canvas.height/4){
		ctx.moveTo(canvas.width/2 - canvas.height/8,cmp);
		ctx.lineTo(canvas.width/2 - canvas.height/8,cmp-45);
		ctx.moveTo(canvas.width/2 + canvas.height/8,cmp);
		ctx.lineTo(canvas.width/2 + canvas.height/8,cmp-45);
		cmp-=65;
	}


	ctx.stroke();
}


let startTL = false;
let stuporCheck = false;

let vx = 0,
	vy = 0;
let carsForBeivelyaOne = [];
let carsForBeivelyaTwo = [];

let carsForProstectOne = [];
let carsForProstectTwo = [];

carsForBeivelyaOne = creatingStream(CoordStreamsX[0],CoordStreamsY[0],DirectionsStreams[0],50);
carsForBeivelyaTwo = creatingStream(CoordStreamsX[1],CoordStreamsY[1],DirectionsStreams[1],50);

carsForProstectOne = creatingStream(CoordStreamsX[2],CoordStreamsY[2],DirectionsStreams[2],20);
carsForProstectTwo = creatingStream(CoordStreamsX[3],CoordStreamsY[3],DirectionsStreams[3],20);

let carsAfterCrossroad = [];
let c = 0;

function trafficFlowMovement(T_light ,coordTL_y, coordTL_x, direction,carsInFirstLane, carsInSecondLane, vedYl){
	let stuporCheck = false;
	for(let i = 0; i<carsInFirstLane.length; i++)  carsInFirstLane[i].print();

	let k = 0;
	for(let i = 0; i<carsInFirstLane.length; i++){
		if(((carsInFirstLane[i].nY - coordTL_y + (10 - 75)*Math.round(Math.cos(direction/180*Math.PI)))*Math.round(Math.cos(direction/180*Math.PI)) < 0 
			|| (carsInFirstLane[i].nX - coordTL_x + (10 - 75)*Math.round(Math.sin(direction/180*Math.PI)))*Math.round(Math.sin(direction/180*Math.PI)) < 0) && carsInFirstLane[i].stateOfMotion == true) k++;
	}
	/*if(vedYl){
		if(carsInFirstLane.length - k > 30) times = 40;
		if(carsInFirstLane.length - k <= 30) times = 30;
	//	if(carsInFirstLane.length - k <= 20) times = 20;
	}*/

	for(let i = 0; i<carsInFirstLane.length; i++){
		if(i < k) carsInFirstLane[i].processMovingStraightFA();
		else{
			if((!(T_light.phase == 2 && T_light.phaseTime >=8))  && carsInFirstLane[i].checkStopConditions(coordTL_x +(180*Math.abs(k-i)-400)*Math.round(Math.sin(direction/180*Math.PI)),
			 coordTL_y + (180*Math.abs(k-i)-400)*Math.round(Math.cos(direction/180*Math.PI)) , T_light.phaseTime, T_light.phase)){
				carsInFirstLane[i].processSmoothStop(coordTL_x + (180*Math.abs(k-i)-400)*Math.round(Math.sin(direction/180*Math.PI)), coordTL_y  + (180*Math.abs(k-i)-400)*Math.round(Math.cos(direction/180*Math.PI)));

			let SpY = carsInFirstLane[i].speedY;
			let SpX = carsInFirstLane[i].speedX;
				if(((SpY*SpY/(2*carsInFirstLane[i].aY+0.0000001) - (coordTL_y + 180*Math.abs(k-i)*Math.round(Math.cos(direction/180*Math.PI)))*0.9)*Math.round(Math.cos(direction/180*Math.PI)) < 0 && SpY*SpY/(2*carsInFirstLane[i].aY+0.0000001) > 0.1)
					|| ( (SpX*SpX/(2*carsInFirstLane[i].aX+0.0000001) - (coordTL_x + 180*Math.abs(k-i)*Math.round(Math.sin(direction/180*Math.PI)))*0.9)*Math.round(Math.sin(direction/180*Math.PI)) < 0 && SpX*SpX/(2*carsInFirstLane[i].aX+0.0000001) > 0.1)){
					carsInFirstLane[i].stateOfMotion = true;
				}
			}
			else if(carsInFirstLane[i].stateOfMotion == true){
				carsInFirstLane[i].processMovingStraightFA();
			}
			else carsInFirstLane[i].processSmoothStop(coordTL_x + (180*Math.abs(k-i)-400)*Math.round(Math.sin(direction/180*Math.PI)), coordTL_y + (180*Math.abs(k-i)-400)*Math.round(Math.cos(direction/180*Math.PI)));
		}
	}

	printInform(T_light.x,T_light.y, T_light.angle,k,carsInFirstLane.length-k);

	if(T_light.phase == 2 && (T_light.phaseTime == times || T_light.phaseTime == 60- times) && !stuporCheck){
		let stuporTime = 0;
		for(let i = k; i<carsInFirstLane.length; i++){
			setTimeout(function(){carsInFirstLane[i].stateOfMotion = true;},(stuporTime = carsInFirstLane[i].stuporBeforeStart(stuporTime))*1000);

		}
		stuporCheck = true;
	}
	if(T_light.phase == 1 && stuporCheck){
		stuporCheck = false;
		return carsInFirstLane.length-k;
	} 


}


function trafficFlowMovement1(T_light ,coordTL_y, coordTL_x, direction,carsInFirstLane, carsInSecondLane, vedYl){
	let stuporCheck = false;
	for(let i = 0; i<carsInFirstLane.length; i++)  carsInFirstLane[i].print();

	let k = 0;
	for(let i = 0; i<carsInFirstLane.length; i++){
		if(((carsInFirstLane[i].nY - coordTL_y + (10 - 75)*Math.round(Math.cos(direction/180*Math.PI)))*Math.round(Math.cos(direction/180*Math.PI)) < 0 
			|| (carsInFirstLane[i].nX - coordTL_x + (10 - 75)*Math.round(Math.sin(direction/180*Math.PI)))*Math.round(Math.sin(direction/180*Math.PI)) < 0) && carsInFirstLane[i].stateOfMotion == true) k++;
	}

	if(vedYl){
		if(carsInFirstLane.length - k > 30) times = 40;
		if(carsInFirstLane.length - k <= 25) times = 30;
	//	if(carsInFirstLane.length - k <= 20) times = 20;
	}

	for(let i = 0; i<carsInFirstLane.length; i++){
		if(i < k){ 
			if(carsInFirstLane[i].futureDirection == 1 
				&& ((carsInFirstLane[i].nY - coordTL_y + (10 - 50)*Math.round(Math.cos(direction/180*Math.PI)))*Math.round(Math.cos(direction/180*Math.PI)) < 0 
			|| (carsInFirstLane[i].nX - coordTL_x + (10 - 50)*Math.round(Math.sin(direction/180*Math.PI)))*Math.round(Math.sin(direction/180*Math.PI)) < 0) && carsInFirstLane[i].stateOfMotion == true)  carsInFirstLane[i].processTurningRight();
			else{ carsInFirstLane[i].processMovingStraight();
			}
		}
		else{
				if((!(T_light.phase == 2 && T_light.phaseTime >=8))  && carsInFirstLane[i].checkStopConditions(coordTL_x +(180*Math.abs(k-i)-400)*Math.round(Math.sin(direction/180*Math.PI)),
				 coordTL_y + (180*Math.abs(k-i)-400)*Math.round(Math.cos(direction/180*Math.PI)) , T_light.phaseTime, T_light.phase)){
					carsInFirstLane[i].processSmoothStop(coordTL_x + (180*Math.abs(k-i)-400)*Math.round(Math.sin(direction/180*Math.PI)), coordTL_y  + (180*Math.abs(k-i)-400)*Math.round(Math.cos(direction/180*Math.PI)));

				let SpY = carsInFirstLane[i].speedY;
				let SpX = carsInFirstLane[i].speedX;
		
					if(((SpY*SpY/(2*carsInFirstLane[i].aY+0.0000001) - (coordTL_y + 180*Math.abs(k-i)*Math.round(Math.cos(direction/180*Math.PI)))*0.9)*Math.round(Math.cos(direction/180*Math.PI)) < 0 && SpY*SpY/(2*carsInFirstLane[i].aY+0.0000001) > 0.1)
						|| ( (SpX*SpX/(2*carsInFirstLane[i].aX+0.0000001) - (coordTL_x + 180*Math.abs(k-i)*Math.round(Math.sin(direction/180*Math.PI)))*0.9)*Math.round(Math.sin(direction/180*Math.PI)) < 0 && SpX*SpX/(2*carsInFirstLane[i].aX+0.0000001) > 0.1)){
						carsInFirstLane[i].stateOfMotion = true;
					}
				}
				else if(carsInFirstLane[i].stateOfMotion == true){
					carsInFirstLane[i].processMovingStraight();
				}
				else carsInFirstLane[i].processSmoothStop(coordTL_x + (180*Math.abs(k-i)-400)*Math.round(Math.sin(direction/180*Math.PI)), coordTL_y + (180*Math.abs(k-i)-400)*Math.round(Math.cos(direction/180*Math.PI)));
			}
		
	}

	printInform(T_light.x,T_light.y, T_light.angle,k,carsInFirstLane.length-k);

	if(T_light.phase == 2 && T_light.phaseTime == times && !stuporCheck){
		let stuporTime = 0;
		for(let i = k; i<carsInFirstLane.length; i++){
			setTimeout(function(){carsInFirstLane[i].stateOfMotion = true;},(stuporTime = carsInFirstLane[i].stuporBeforeStart(stuporTime))*1000);

		}
		stuporCheck = true;
	}
	if(T_light.phase == 1 && stuporCheck) {
		stuporCheck = false;
	}
	return carsInFirstLane.length-k;
}

let checkTime = false;

function updateTimes(time,count){
	fuzzyfication(time,count);
	times+=defuzzyfication();
	console.log(times);
}

function crossroads(){
	requestID = requestAnimationFrame(crossroads);
	ctx.clearRect(0,0, canvas.width, canvas.height);
	drawCrossroads();
	let count = [0,0,0,0];

	T_lights[0].print();
	T_lights[1].print();
	T_lights[2].print();
	T_lights[3].print(); 

	if(!startTL){
		setInterval(function(){T_lights[0].timeChange();},1000);
		setInterval(function(){T_lights[1].timeChange();},1000);
		setInterval(function(){T_lights[2].timeChangeBlack();},1000);
		setInterval(function(){T_lights[3].timeChangeBlack();},1000);
	//	setInterval(function(){updateTimes(times,count[0]);},60000);
		startTL = true;
	}
	count[1] = trafficFlowMovement1(T_lights[1], 170,canvas.width/2 - 2*canvas.height/32 - 100, DirectionsStreams[1], carsForBeivelyaTwo, carsAfterCrossroad,0);
	count[2] = trafficFlowMovement(T_lights[2], canvas.height/2 + 50, 270, DirectionsStreams[2], carsForProstectOne, carsAfterCrossroad,0);
	count[3] = trafficFlowMovement(T_lights[3], canvas.height/2 - 50, canvas.width-270, DirectionsStreams[3], carsForProstectTwo, carsAfterCrossroad,0);
	count[0] = trafficFlowMovement1(T_lights[0], canvas.height-170,canvas.width/2 + 2*canvas.height/32 + 100, DirectionsStreams[0], carsForBeivelyaOne, carsAfterCrossroad,1);
}

canvas.addEventListener('mouseover', function(e) {
  requestID = window.requestAnimationFrame(crossroads);
});

canvas.addEventListener('mouseout', function(e) {
  window.cancelAnimationFrame(requestID);
});