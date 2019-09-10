(function () {

	function Model() {
		//таймер
		this.changeListener = null;
		this.workMin = 25;
		this.breakMin = 5;
		this.isBreak = false;
		this.isPaused = true;
		this.time;
		this.alarm = new Audio("https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3");
		//конец model таймера
		//список проектов
		let myAppView = null,
            projectsList = []

        this.init = function (view) {
            myAppView = view;
            this.getProjectsList();
            this.printProjectsList();
        }
        // графики
        this.drawGraphM = function(view) {
		   this.database = firebase.database();
		   this.tasks = null;
		   this.name = null;
		   this.total = null;
		   let names = [];
		   let totals = [];
		   this.countProjAll = null;
		   //var names = null;
		   this.database.ref('Tasks/').on('value', function(snapshot) {
		        names.length = 0;
		        totals.length = 0;
		        this.countProjAll = 0;
		        this.tasks = snapshot.val();
		        var keys = Object.keys(tasks);
		            for (var i = 0; i < keys.length; i++) {
		                var k = keys[i];
		                this.name = tasks[k].name;
		                this.total = tasks[k].total;
		                countProjAll += tasks[k].total;
		                names.push(name);
		                totals.push(total);
		            }
		        myAppView.drawGraph(names, totals);
		    })
   }
        this.addProject = function(projectname, projectscore) {
        	if (projectname === '') {
                alert("Необходимо заполнить поле!"); 
            } else {
            myAppDB.ref('Tasks/' + `task_${projectname.replace(/\s/g, "").toLowerCase()}`).set({
                name: `${projectname}`,
                total: 0
                //pomodoro: []

            })
            .then(function (projectname) {
                console.log("Проект добавлен в коллецию");
            })
            .catch(function (error) {
                console.error("Ошибка добавления проекта: ", error);
            });

            this.updateProjectsList();
        }}

        this.deleteProject = function(projectid) {
        	console.log(projectid);
            myAppDB.ref('Tasks/' + projectid).remove()
            .then(function () {
                console.log("Проект удален из коллеции");
            })
            .catch(function (error) {
                console.error("Ошибка удаления проекта: ", error);
            });

            this.updateProjectsList();
        }

        this.downAmountProjects = function(projectid) {
        	console.log(projectid);
            var score = null;
            myAppDB.ref('Tasks/' + projectid).child('total').on('value', function(snapshot) {
                score = snapshot.val();
                score--;
               });
                if (score === -1) {
                   return;
                }
            myAppDB.ref('Tasks/' + projectid).child("total").set(score--);
            this.updateProjectsList();
        }
        this.addPomodoro = function (projectid) {
        	let newTask = prompt('Введите название помидорчика');
        	//myAppDB.ref('Tasks/' + projectid).child("pomodoro").set(newTask);

        }    
        this.upAmountProjects = function(projectid) {
            var score = null;
            myAppDB.ref('Tasks/' + projectid).child('total').on('value', function(snapshot) {
                score = snapshot.val();
                score++;
               });
            myAppDB.ref('Tasks/' + projectid).child("total").set(score++);
            this.updateProjectsList();
        }


        this.getProjectsList = function() {
             myAppDB.ref("Tasks/").once("value", function(snapshot) {
                let result = snapshot.val();
                }, function (error) {
                console.log("Error: " + error.code);
            });
        }

        this.printProjectsList = function() {
            myAppDB.ref("Tasks/").on("value", function(snapshot) {
                myAppView.printProject(snapshot.val());
                }, function (error) {
                console.log("Error: " + error.code);
            });
        }

        this.updateProjectsList = function() {
            myAppView.clearProjectList();
            this.printProjectsList();
        }
 
	};
	// конец model списка проектов
	// model todolist		
	// view
	function View() {
		// список проектов 
		let appContainer = null;
		let pomoContainer = null;

        this.init = function(app) {
            appContainer = app;
            this.printTestData();
            this.addProjectForm();
        }
        this.printTestData = function () {
            appContainer.innerHTML = `
            	<div id="pomosect"></div>
                <div id="business"></div>
                <table class="table">
                    <thead>
                        <tr>
                            <th class="name">Проект</th>
                            <th class="count">Количество помидорок</th>
                            <th>Добавить новый помидоро</th>
                            <th>Удалить проект</th>
                        </tr>
                    </thead>
                    <tbody id="list-proj"></tbody>
                </table>
            `;
        }
        
        this.addProjectForm = function() {
            document.getElementById('business').innerHTML += `
            <div id="projects">
              <div class="header">
                <h2>Список проектов</h2>
                <input type="text" id="myProj" placeholder="Проект">
                <span class="addBtn" id="addBtn">Добавить</span>
              </div>
              <div id="projectsAll"></div>
            </div>
            `;
        }

        this.printProject = function(projectList) {
            for (var project in projectList) {
                let projectListContainer = document.getElementById('list-proj'),
                    row = document.createElement('tr'),
                    td1 = document.createElement('td'),
                    td2 = document.createElement('td'),
                    td3 = document.createElement('td');
                    td4 = document.createElement('td');
                row.setAttribute('data-id', project);
                td1.innerHTML = `${projectList[project].name}`;
                td2.innerHTML = `<span ><i class="fa fa-arrow-down down" aria-hidden="true"></i></span>${projectList[project].total}<span><i class="fa fa-arrow-up up" aria-hidden="true"></i></span>`;
                td4.innerHTML = `<a href="# title="добавить новый помидорчик" <i class="fa fa-plus-square-o addPomidoro" aria-hidden="true"></i></a>`;
                td3.innerHTML = `<a href="#" title="удалить проект"> <i class="fa fa-window-close-o projDelete" aria-hidden="true"></i></a>`;
                row.appendChild(td1);
                row.appendChild(td2);
                row.appendChild(td4);
                row.appendChild(td3);

                if (projectListContainer) {
                    projectListContainer.appendChild(row);
                }
            }

        }

        this.clearProjectList = function() {
            let container = document.getElementById('list-proj');
            if (container) container.innerHTML = '';
        }
        // конец view списка проектов
        // charts
        this.drawGraph = function(names, totals){

			var ctx = document.getElementById('myChart').getContext('2d');
		    var chart = new Chart(ctx, {
		        // The type of chart we want to create
		        type: 'bar',

		        // The data for our dataset
		        data: {
		            labels: names,
		            datasets: [{
		                label: 'Статистика по проектам',
		                backgroundColor: 'rgb(30, 144, 255)',
		                borderColor: 'rgb(65, 105, 225)',
		                data: totals
		            }]
		        },

		        // Configuration options go here
		        options: {}
		    })
		};
        // конец view charts
		// таймер
		var timerDisplay = document.querySelector('.timerDisplay');
		var workMinItem = document.getElementById('work-min');
		var breakMinItem = document.getElementById('break-min');

		this.workPlus = document.getElementById('work-plus');
	    this.workMinus = document.getElementById('work-minus');
	    this.breakPlus = document.getElementById('break-plus');
	    this.breakMinus = document.getElementById('break-minus');
		this.startBtn = document.getElementById('start-btn');
		this.resetBtn = document.getElementById('reset');

		this.showTimer = (min, sec) => {
			if (sec < 10) {
				timerDisplay.innerHTML = `${min}:0${sec}`;
			}
			else {
				timerDisplay.innerHTML = `${min}:${sec}`;
			}
		}

		this.showWorkMin = (model) => {
			workMinItem.innerHTML = `${model.workMin}`;
		}

		this.showBreakMin = (model) => {
			breakMinItem.innerHTML = `${model.breakMin}`;
		}

		this.modButton = (model) => {
			this.startBtn.innerHTML = (model.isPaused) ? "СТАРТ!" : "СТОП";
		}
		// конец view таймера
		// todolist
		this.myNodelist = document.getElementsByTagName("li");
	    this.close = document.getElementsByClassName("close");
	    this.edit = document.getElementsByClassName('edit');
	    this.list = document.querySelector('ul');
	    this.addBtnToDo = document.getElementById("addToDo");

	    // Создаем кнопку (крестик) для закрытия и располагаем в каждом LI
	    this.addClose = () => {
	      for (let i = 0; i < this.myNodelist.length; i++) {
	        if (this.myNodelist[i].querySelectorAll(".close").length === 0) {
	          let span = document.createElement("span");
	          span.innerHTML = "&#65794;";
	          span.className = "close";
	          span.style.fontWeight = "bold";
	          this.myNodelist[i].appendChild(span);
	        }
	      }
	    }

	    // Создаем кнопку (пишущая рука) для исправления и располагаем в каждом LI
	    this.addEdit = () => {
	      for (let i = 0; i < this.myNodelist.length; i++) {
	        if (this.myNodelist[i].querySelectorAll(".edit").length === 0) {
	          let spanEdit = document.createElement("span");
	          spanEdit.innerHTML = "&#9997;";
	          spanEdit.className = "edit";
	          this.myNodelist[i].appendChild(spanEdit);
	        }
	      }
	    }
	    
	};
	// конец view todolist
	

	// controller
	function Controller(model, view) {
		// таймер
		this.view = view;
		this.model = model;

		let timer = null;
		let min = this.model.isBreak ? this.model.breakMin : this.model.workMin;
		let sec = 0;
		let projnumber = null;

		this.view.showWorkMin(this.model)
		this.view.showBreakMin(this.model)
		this.view.showTimer(min, sec);
		
		let timerCalc = () => {
			this.view.showTimer(min, sec);
			if (sec === 0) {
				sec = 60;
				min--;
			}
			sec--;
			if (min >= 0 && sec >= 0) {
				timer = setTimeout(timerCalc, 1000);
			} else {
				this.model.alarm.currentTime = 0;
        		this.model.alarm.play();
        		
				this.model.isBreak = !this.model.isBreak;
				console.log(this.model.breakMin, this.model.workMin);
				//min = this.model.isBreak ? this.model.breakMin : this.model.workMin;
				if (this.model.isBreak) {
					min = this.model.breakMin;
					sec = 0;
					timer = setTimeout(timerCalc, 1000);
					if (projnumber != null) {
        				myAppModel.upAmountProjects(projnumber);
        			}
				} else {
					return;
				}
				
				
			}
		};
		let startTimer = (projectid) => {
			projnumber = projectid;
			clearTimeout(timer);
			if (this.model.isPaused) {
				this.model.isPaused = false;
				timerCalc();
			} else {
				this.model.isPaused = true;
			}
			this.view.modButton(this.model);
		};
		this.view.startBtn.addEventListener('click', startTimer);
		

		this.view.workPlus.addEventListener('click', () => {
			if (this.model.workMin < 60) {
				this.model.workMin += 5;
				if (!this.model.isBreak) {
					min = this.model.workMin;
					sec = 0;
					this.view.showTimer(min, sec);
				}
				this.view.showWorkMin(this.model);
			}
		});

		this.view.workMinus.addEventListener('click', () => {
			if (this.model.workMin > 5) {
				this.model.workMin -= 5;
				if (!this.model.isBreak) {
					min = this.model.workMin;
					sec = 0;
					this.view.showTimer(min, sec);
				}
				this.view.showWorkMin(this.model);
			}
		});

		this.view.breakPlus.addEventListener('click', () => {
			if (this.model.breakMin < 60) {
				this.model.breakMin += 5;
				if (this.model.isBreak) {
					min = this.model.breakMin
					sec = 0;
					this.view.showTimer(min, sec);
				}
				this.view.showBreakMin(this.model);
			}
		});

		this.view.breakMinus.addEventListener('click', () => {
			if (this.model.breakMin > 5) {
				this.model.breakMin -= 5;
				if (this.model.isBreak) {
					min = this.model.breakMin
					sec = 0;
					this.view.showTimer(min, sec);
				}
				this.view.showBreakMin(this.model);
			}
		});

		this.view.resetBtn.addEventListener('click', () => {
			clearTimeout(timer);
      		this.model.isPaused = true;
			this.model.isBreak = false;
			min = this.model.isBreak ? this.model.breakMin : this.model.workMin;
			sec = 0;
			this.view.showWorkMin(this.model)
			this.view.showBreakMin(this.model)
			this.view.showTimer(min, sec);
			this.view.showTimer(min, sec);
			this.view.modButton(this.model);
		});
		// конец controller таймера
		// todolist
		// При клике по крестику удаляем текущий LI
	    let delLi = () => {
	      for (let i = 0; i < this.view.close.length; i++) {
	        this.view.close[i].onclick = function() {
	          let div = this.parentElement;
	          div.remove();
	        }
	      }
	    }

	    // При клике на "кор.руку" значение текущего LI переносим в основной INPUT с возможностью исправления, а сам LI удаляем 
	    let clickPen = () => {
	      for (let k = 0; k < this.view.edit.length; k++) {
	        this.view.edit[k].onclick = function(){
	          let divEdit = this.parentElement;
	          divEdit.style.display = "none";
	          let task = this.parentElement.innerHTML.split('<span')[0];
	          document.getElementById("myInput").value = task;
	        }
	      }
	    }

	    // Добавляем класс "checked" при клике по любому LI (и наоборот)
	    let checked = () => {
	      this.view.list.addEventListener('click', function(e) {
	        if (e.target.tagName === 'LI') {
	          e.target.classList.toggle('checked'); //Если класс у элемента отсутствует - добавляет, иначе - убирает. 
	        }
	      });
	    }

	    // Создаем новый LI в списке после нажатия кнопки "Добавить"
	    let newElement = () => {
	      var li = document.createElement("li");
	      var inputValue = document.getElementById("myInput").value;
	      var t = document.createTextNode(inputValue);
	      li.appendChild(t);
	      if (inputValue === '') {
	        alert("Необходимо заполнить поле!");
	      } else {
	        document.getElementById("myUL").appendChild(li);
	      }
	      document.getElementById("myInput").value = "";
	      this.view.addClose();
	      this.view.addEdit();
	      delLi();
	      clickPen();
	    }

	    this.view.addClose();
	    this.view.addEdit();
	    delLi();
	    clickPen();
	    checked();
	    this.view.addBtnToDo.addEventListener('click', newElement);
	    //this.view.drawGraph();
		// конец controller todolist
		// список проектов
		let myAppModel = null,
            appContainer = null,
            form = null,
            addBtn = null;

        this.init = function (app, model) {
            myAppModel = model;
            appContainer = app;

            document.addEventListener('click', function(event) {
                form = appContainer.querySelector('#myProj');
                addBtn = appContainer.querySelector('#addBtn');

                if (event.target && event.target.id === 'addBtn') {
                    event.preventDefault();
                    event.stopPropagation();
                    myAppModel.addProject(
                        form.value,
                    );
                    form.value = ''
                }
                if (event.target && event.target.classList.contains('down')) {
                    event.preventDefault();
                    event.stopPropagation();
                    myAppModel.downAmountProjects(event.target.parentElement.parentElement.parentElement.dataset.id);
                }
                if (event.target && event.target.classList.contains('up')) {
                    event.preventDefault();
                    event.stopPropagation();
                    myAppModel.upAmountProjects(event.target.parentElement.parentElement.parentElement.dataset.id);
                }
                if (event.target && event.target.classList.contains('addPomidoro')) {
                    event.preventDefault();
                    event.stopPropagation();
                    startTimer(event.target.parentElement.parentElement.dataset.id);
                    //myAppModel.addPomodoro(event.target.parentElement.parentElement.dataset.id);
                }

                if (event.target && event.target.classList.contains('projDelete')) {
                    event.preventDefault();
                    event.stopPropagation();
                    myAppModel.deleteProject(event.target.parentElement.parentElement.parentElement.dataset.id);
                }
            });
        }
	}
	// конец controller списка проектов
	const myApp = {
		init: function () {
			model = new Model();
			view = new View();
			controller = new Controller(model, view);

			//view.printTimer();
			view.init(document.getElementById('app'));
            model.init(view);
            controller.init(document.getElementById('app'), model);
            model.drawGraphM(view);
		},
	};

	myApp.init();
})();

