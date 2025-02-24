const appFitnessTracker = (containerId, { cssFile = "style.css" }) => {
    const container = document.getElementById(containerId);

    const calendarId = containerId + "-calendar";
    const tableId = containerId + "-table";

    const tableElememntId = containerId + "-table";
    const calendarElemId = containerId + "-calendar";
    const calendarWrapperId = containerId + "-calendar-wrapper";
    const dayId = containerId + "-day";


    // Устанавливаю текущую дату для показа в календаре при каждой перезагрзузке
    localStorage.setItem("month-" + containerId, (new Date().getMonth() + 1).toString());
    localStorage.setItem("year-" + containerId, (new Date().getFullYear()).toString());

    const options = [
        new Option("Жим лежа", "Жим лежа"),
        new Option("Приседания со штангой", "Приседания со штангой"),
        new Option("Становая тяга", "Становая тяга"),
        new Option("Жим над головой", "Жим над головой"),
        new Option("Подтягивания", "Подтягивания"),
        new Option("Жим штанги лежа узким хватом", "Жим штанги лежа узким хватом"),
        new Option("Рывок", "Рывок"),
        new Option("Приседания с гирей", "Приседания с гирей"),
        new Option("Жим ногами", "Жим ногами"),
        new Option("Армейский жим", "Армейский жим"),
        new Option("Тяга штанги к подбородку", "Тяга штанги к подбородку"),
        new Option("Разгибание трицепсов", "Разгибание трицепсов"),
        new Option("Бицепс-молоточки", "Бицепс-молоточки"),
        new Option("Сгибание бицепса", "Сгибание бицепса"),
        new Option("Сгибание бицепса в скамье под наклоном", "Сгибание бицепса в скамье под наклоном"),
        new Option("Жим лежа под углом", "Жим лежа под углом"),
    ];
    const weekdays = ["Пн", "Вт", "Ср", "Чт" , "Пт", "Сб", "Вск"];
    const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август",
        "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

    // Вспомогательная функция для создания элемента
    const createElement = (tag, { classes = [], attributes = {}, innerHTML = "" } = {}) => {
        const el = document.createElement(tag);
        if (classes.length) {
            el.classList.add(...classes);
        }
        for (const attr in attributes) {
            if (attributes.hasOwnProperty(attr)) {
                el.setAttribute(attr, attributes[attr]);
            }
        }
        if (innerHTML) {
            el.innerHTML = innerHTML;
        }
        return el;
    };

    // Функция для создания элемента input с подписью
    const inputContainer = (field, type = "text", name) => {
        const container = document.createElement("div");
        container.classList.add("input-container");

        const label = document.createElement("div");
        label.classList.add("input-label");
        label.innerHTML = `${field}: `;
        container.append(label);

        const input = document.createElement("input");
        input.classList.add("input-field");
        input.required = true;
        input.type = type;
        input.name = name.toLowerCase();
        container.append(input);

        return container;
    }

    // Функция для отрисовки таблицы
    const rerenderTable = (elemTableId) => {
        const table = document.getElementById(elemTableId);

        if (!table) {
            console.error("No calendar found with id " + elemTableId);
            return;
        }

        table.innerHTML = "";

        const tableHeader = createElement("thead", {
            classes: ["exercise-header-container"]
        });
        const headerRow = document.createElement("tr");
        tableHeader.append(headerRow);

        const tableBody = createElement("tbody", {classes: ["table-body"]});

        table.append(tableHeader);
        table.append(tableBody);

        const headers = ["Упражнение", "Вес", "Повторения", "Подходы"];
        headers.forEach(header => {
            const th = createElement("th", {
                classes: ["exercise-header"],
                innerHTML: header
            });
            headerRow.append(th);
        });

        const exercises = JSON.parse(localStorage.getItem(tableId)) || [];
        console.log("Exercises:", exercises);

        exercises.forEach(exercise => {
            const row = createElement("tr");

            const exerciseCell = createElement("td", {
                classes: ["exercise-row"],
                innerHTML: exercise.exercise
            });
            const weightCell = createElement("td", {
                classes: ["exercise-row"],
                innerHTML: exercise.weight
            });
            const repsCell = createElement("td", {
                classes: ["exercise-row"],
                innerHTML: exercise.reps
            });
            const setsCell = createElement("td", {
                classes: ["exercise-row"],
                innerHTML: exercise.sets
            });

            row.append(exerciseCell, weightCell, repsCell, setsCell);
            tableBody.append(row);
        });
    };

    // Функция для отрисовки календаря для определенного месяца и года
    const renderCalendar = (calendarContainer) => {
        const calendarWrapper = document.getElementById(calendarContainer);

        const month = Number(localStorage.getItem("month-" + containerId));
        const year = Number(localStorage.getItem("year-" + containerId));

        if (!calendarWrapper) {
            console.error("No calendar found with id " + calendarContainer);
            return;
        }

        calendarWrapper.innerHTML = "";

        const caption = createElement("div", {
            classes: ["calendar-caption"],
            innerHTML: `${monthNames[month - 1]} ${year}`
        });
        calendarWrapper.append(caption);

        const firstDayDate = new Date(year, month - 1, 1);
        const firstDay = firstDayDate.getDay();

        const daysInMonth = new Date(year, month, 0).getDate();

        const calendar = createElement("div", {
            classes: ["calendar"]
        });
        calendarWrapper.append(calendar);

        const offset = (firstDay + 6) % 7;

        weekdays.forEach(weekday => {
            calendar.append(createElement("div", {
                classes: ["calendar-weekday"],
                innerHTML: weekday
            }));
        });

        for (let i = 0; i < offset; i++) {
            calendar.append(createElement("div", {}));
        }

        const workoutsData = JSON.parse(localStorage.getItem(calendarId)) || [];

        const workoutDates = new Set();

        workoutsData.forEach(entry => {
            if (entry.exercises && entry.exercises.length > 0) {
                workoutDates.add(entry.data);
            }
        });

        for (let i = 1; i <= daysInMonth; i++) {
            let elem = createElement("div", {
                innerHTML: i.toString(),
                classes: ["calendar-cell"]
            })

            const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;

            if (workoutDates.has(formattedDate)) {
                elem.classList.add("workout-day")
                // Добавляем обработчик клика
                elem.addEventListener("click", () => {
                    console.log("Нажата дата с тренировкой:", formattedDate);
                    showDayContainer();
                });
            }
            calendar.append(elem);
        }

    }

    // Инициализация таблицы текущей тренировки
    if (!localStorage.getItem(tableId)) {
        localStorage.setItem(tableId, JSON.stringify([]));
    }

    // Инициализация списка законченных тренировок для календаря
    if (!localStorage.getItem(calendarId)) {
        localStorage.setItem(calendarId, JSON.stringify([]));
    }

    const wrapper = createElement("div", {
        classes: ["fitness-tracker"]
    });

    container.append(wrapper);

    const showCalendarContainer = () => {
        const calendarContainer = createElement("div", {
            classes: ["calendar-container"],
            attributes: {
                id: calendarElemId
            }
        })
        wrapper.append(calendarContainer);

        const calendarHeader = createElement("div", {
            classes: ["calendar-header", "current-training-text"],
            innerHTML: "Календарь тренировок"
        });
        calendarContainer.append(calendarHeader);

        const calendarWrapper = document.createElement("div");
        calendarWrapper.id = calendarWrapperId;
        calendarWrapper.classList.add("calendar-wrapper-inner");
        calendarContainer.append(calendarWrapper);

        renderCalendar(calendarWrapperId);

        const arrow_container = document.createElement("div");
        arrow_container.classList.add("arrow-container");

        // SVG для левой стрелки
        const leftArrowSVG = `
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="arrow-icon" viewBox="0 0 24 24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>`
        ;
        const leftArrow = createElement("div", {
            classes: ["arrow"],
            innerHTML: leftArrowSVG,
        });
        arrow_container.append(leftArrow);

        leftArrow.onclick = () => {
            console.log("left");
            const month = Number(localStorage.getItem("month-" + containerId));
            const year = Number(localStorage.getItem("year-" + containerId));

            if (month <= 1) {
                localStorage.setItem("year-" + containerId, (year - 1).toString());
                localStorage.setItem("month-" + containerId, "12");
            } else {
                localStorage.setItem("month-" + containerId, (month - 1).toString());
            }

            renderCalendar(calendarWrapperId);
        };

        // SVG для правой стрелки
        const rightArrowSVG = `
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="arrow-icon" viewBox="0 0 24 24">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
              </svg>`;
        const rightArrow = createElement("div", {
            classes: ["arrow"],
            innerHTML: rightArrowSVG,
        });
        arrow_container.append(rightArrow);

        rightArrow.onclick = () => {
            console.log("right");
            const month = Number(localStorage.getItem("month-" + containerId));
            const year = Number(localStorage.getItem("year-" + containerId));

            if (month >= 12) {
                localStorage.setItem("year-" + containerId, (year + 1).toString());
                localStorage.setItem("month-" + containerId, "1");
            } else {
                localStorage.setItem("month-" + containerId, (month + 1).toString());
            }

            renderCalendar(calendarWrapperId);
        };

        calendarContainer.append(arrow_container);
        wrapper.append(calendarContainer);
    };

    const showMenuContainer = () => {
        // Обертка всей формы в отдельный элемент
        const menu = createElement("div", { classes: ["menu"] });

        // Добавление заголовка для понятности
        const trainingText = createElement("div", {
            classes: ["training-text"],
            innerHTML: "Тренировка"
        });
        menu.append(trainingText);

        // Создание формы для сбора информации о выполненом упражнии внутри тренировки
        const exerciseForm = createElement("form", { classes: ["exercise-form"] });
        menu.append(exerciseForm);

        const exerciseCont = createElement("div", {
            classes: ["input-container"]
        });
        const exerciseText = createElement("div", {
            classes: ["input-label"],
            innerHTML: "Упражнение: "
        });
        exerciseCont.append(exerciseText);

        const exerciseSelect = createElement("select", {
            classes: ["exercise-select"],
            attributes: {
                name: "exercise"
            }
        });

        options.forEach(option => exerciseSelect.add(option));
        exerciseCont.append(exerciseSelect);
        exerciseForm.append(exerciseCont);

        const inputs = [
            {label: "Вес", type: "number", name: "weight"},
            {label: "Повторения", type: "number", name: "reps"},
            {label: "Подходы", type: "number", name: "sets"}
        ];

        inputs.forEach(input => {
            const elem = inputContainer(input.label, input.type, input.name);
            exerciseForm.append(elem);
        })

        // Кнопка отправки
        const submit = createElement("input", {
            classes: ["submit-button"],
            attributes: { type: "submit", value: "Добавить упражнение" }
        });

        exerciseForm.append(submit);

        // Функция, вызываемая при нажатии на "Добавить упражнение"
        exerciseForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const formData = new FormData(exerciseForm);
            const data = {};

            formData.forEach((value, key) => {
                data[key] = value;
            });

            if (data.weight >= 200) {
                alert("Вы долбоеб столько жать")
                return;
            }

            if (data.weight < 0) {
                alert("Вы долбоеб?")
                return;
            }

            console.log("Полученные данные формы:", data);


            const storedData = localStorage.getItem(tableId);
            const trainings = storedData ? JSON.parse(storedData) : [];

            // Добавляем данные о новой тренировке
            trainings.push(data);

            // Сохраняем обновлённый массив в Local Storage
            localStorage.setItem(tableId, JSON.stringify(trainings));

            rerenderTable(tableElememntId);
            exerciseForm.reset();
        });

        wrapper.append(menu);
    }

    const showCurrContainer = () => {
        const currentTrainingContainer = createElement("div", {
            classes: ["current-training"]
        });

        const currTrainingHeader = createElement("div", {
            classes: ["current-training-text"], innerHTML: "Текущая тренировка"
        });

        currentTrainingContainer.append(currTrainingHeader);

        const tableWrapper = createElement("div", {
            classes: ["table-container"]
        });
        currentTrainingContainer.append(tableWrapper);

        const tableContainer = createElement("table", {
            classes: ["exercise-table"],
            attributes: {
                id: tableElememntId
            }
        });
        tableWrapper.append(tableContainer);
        wrapper.append(currentTrainingContainer);

        rerenderTable(tableElememntId);


        const submitButton = document.createElement("button");
        submitButton.classList.add("submit-button");
        submitButton.innerHTML = "Добавить тренировку в календарь"

        submitButton.onclick = () => {
            const trainingArray = JSON.parse(localStorage.getItem(calendarId));

            const currTrainingData = {
                data: new Date().toISOString().split('T')[0],
                exercises: JSON.parse(localStorage.getItem(tableId))
            };

            trainingArray.push(currTrainingData);

            localStorage.setItem(calendarId, JSON.stringify(trainingArray));
            console.log("Данные для календаря: ", trainingArray);

            // Очистка текущей тренировки
            localStorage.setItem(tableId, JSON.stringify([]));

            // Отрисовка таблицы заново
            rerenderTable(tableElememntId);
            renderCalendar(calendarWrapperId)
        };

        currentTrainingContainer.append(submitButton);

    }

    function generateTraining(training) {
        const mainElem = document.createElement("div", {
            classes: ["training-day"]
        });


        for (let i = 0; i < training.exercises.length; i++) {

        }
        return undefined;
    }

    // функция для показа тренировки в какой-то день
    const showTrainings = () => {
        // Получение всех тренировок из локал стораджа
        const currTrainings = JSON.parse(localStorage.getItem(calendarId));

        // Фильтрация по дате из функции
        let toShow = [];
        currTrainings.forEach((training) => {
            if (training.data === day) {
                toShow.push(training);
            }
        })

        // Создание элемента тренировки для каждой тренировки конкретного дня
        toShow.forEach((training) => {
            const trainingElem = generateTraining(training);
        })


        const dayContainer = createElement("div", {
            classes: ["day-container"],
            attributes: {
                id: dayId
            },
            innerHTML: "some"
        })
        dayContainer.style.display = "none";


        // const dayHeader = createElement("div", {
        //     classes: ["day-header"],
        //     innerHTML:,
        //     attributes: {
        //     }
        // })

        const closeBtn = document.createElement("button");
        closeBtn.classList.add("close-btn");
        closeBtn.innerHTML = "Close"
        closeBtn.addEventListener("click", () => {hideDayContainer()});

        dayContainer.append(closeBtn);

        renderDayContainer("");
        wrapper.append(dayContainer);
    }

    const showDayContainer = () => {
        const elem = document.getElementById(dayId);
        elem.style.display = "flex";
    }

    const hideDayContainer = () => {
        const elem = document.getElementById(dayId);
        elem.style.display = "none";
    }

    const addCss = (css) => {
        if (css) {
            const link = document.createElement("link");
            link.setAttribute("href", css);
            link.setAttribute("rel", "stylesheet");
            document.head.append(link);
        }
    }

    showCalendarContainer();
    showMenuContainer();
    showCurrContainer();
    const day = createElement("div", {
        classes: ["day-container"],
        attributes: {
            id: dayId
        },
        innerHTML: "some"
    });
    day.style.display = "none";



    addCss(cssFile)
}