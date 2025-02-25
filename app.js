const appFitnessTracker = async (containerId, {
    cssFile = "style.css",
    accentColor = "#29339B",
    maxWidth = "2000px",
    fontFamily = `Gill Sans`,
}) => {
    const container = document.getElementById(containerId);

    container.style.setProperty('--primary-color', accentColor);
    container.style.setProperty('--font', fontFamily);

    // конвертация hex в rgba, чтобы задать прозрачность для второстепенного цвета
    function rgbToHex(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    container.style.setProperty('--secondary-color', rgbToHex(accentColor, 0.65));

    const calendarId = containerId + "-calendar";
    const tableId = containerId + "-table";

    const tableElememntId = containerId + "-table";
    const calendarElemId = containerId + "-calendar";
    const calendarWrapperId = containerId + "-calendar-wrapper";
    const dayId = containerId + "-day";

    // Считывание конфига из Json (необходим локальный сервер, иначе ошибка CORS
    const config = await fetch('config.json').then(response => {
            if (!response.ok) {
                throw new Error('Ошибка: ' + response.status);
            }
            return response.json();
        })
        .catch(error => console.error('Ошибка при получении данных:', error));


    const weekdays = config.weekdays;
    const monthNames = config.months;
    const options = []
    config.options.forEach(item => {const opt = new Option(item, item); options.push(opt); });

    // Устанавливаю текущую дату для показа в календаре при каждой перезагрзузке
    localStorage.setItem("month-" + containerId, (new Date().getMonth() + 1).toString());
    localStorage.setItem("year-" + containerId, (new Date().getFullYear()).toString());

    // Вспомогательная функция для создания элемента
    const createElement = (tag, {classes = [], attributes = {}, innerHTML = ""} = {}) => {
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
                    renderDay(formattedDate);
                });
            }
            calendar.append(elem);
        }

    }

    // Функция для отрисовки карточки дня с текущими тренировками
    const renderDay = (day) => {
        // Получение всех тренировок из локал стораджа
        const currTrainings = JSON.parse(localStorage.getItem(calendarId));

        const dayCard = document.getElementById(dayId);

        dayCard.innerHTML = "";

        const day_to_string = (day) => {
            const [year, month, date] = day.split('-');
            const monthNames = [
                "января", "февраля", "марта", "апреля", "мая", "июня",
                "июля", "августа", "сентября", "октября", "ноября", "декабря"
            ];
            return `${parseInt(date)} ${monthNames[parseInt(month) - 1]} ${year}`;
        }

        const dayHeader = createElement("div", {
            classes: ["day-header"],
            innerHTML: day_to_string(day),
        })

        dayCard.append(dayHeader);

        const closeBtn = document.createElement("button");
        closeBtn.classList.add("day-close-button");
        closeBtn.innerHTML = "Закрыть"
        closeBtn.addEventListener("click", () => {
            hideDayContainer()
        });


        // Фильтрация по дате из функции
        let toShow = [];
        currTrainings.forEach((training) => {
            if (training.data === day) {
                toShow.push(training);
            }
        })

        // Создание элемента тренировки для каждой тренировки конкретного дня
        toShow.forEach((training) => {
            const trainingElem = renderTraining(training);
            dayCard.append(trainingElem)
        })

        dayCard.append(closeBtn);
    }

    // Функция для отрисовки прямоугольника из которого будет выскакивать конкретная тренировка
    const renderTraining = (training) => {
        const wrapper = createElement("div", {classes: ["day-wrapper"]});
        const mainContainer = createElement("div", {classes: ["training"]});
        const label = createElement(
            "div", {classes: ["training-label"], innerHTML: "Тренировка"}
        )
        const showTableButton = createElement("button", {
            classes: ["toggle-button"],
            innerHTML: `&#9660`
        });
        mainContainer.append(label);
        mainContainer.append(showTableButton);

        wrapper.append(mainContainer);

        const table = createElement("table", {
            classes: ["day-table", "hidden"],
            attributes: {
                id: containerId + "-day-table"
            }
        });

        showTableButton.addEventListener("click", () => {
            table.classList.toggle("hidden");

            if (table.classList.contains("hidden")) {
                showTableButton.innerHTML = "&#9660;";
            } else {
                showTableButton.innerHTML = "&#9650;";
            }
        });

        wrapper.append(table)

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


        training.exercises.forEach(exercise => {
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


        return wrapper;
    }


    // Инициализация таблицы текущей тренировки
    if (!localStorage.getItem(tableId)) {
        localStorage.setItem(tableId, JSON.stringify([]));
    }

    // Инициализация списка законченных тренировок для календаря
    if (!localStorage.getItem(calendarId)) {
        localStorage.setItem(calendarId, JSON.stringify([]));
    }

    // Элемент-обертка для всего приложения
    const wrapper = createElement("div", {
        classes: ["fitness-tracker"]
    });

    container.append(wrapper);
    container.style.maxWidth = maxWidth;

    // Функция для показа календаря
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
        const menu = createElement("div", {classes: ["menu"]});

        // Добавление заголовка для понятности
        const trainingText = createElement("div", {
            classes: ["training-text"],
            innerHTML: "Тренировка"
        });
        menu.append(trainingText);

        // Создание формы для сбора информации о выполненом упражнии внутри тренировки
        const exerciseForm = createElement("form", {classes: ["exercise-form"]});
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
            attributes: {type: "submit", value: "Добавить упражнение"}
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

            // Валидация формы
            if (data.reps < 1) {
                alert("Нужно хотя бы 1 повторение, меньше = тюбик")
                return;
            }
            if (data.sets < 1) {
                alert("Нужен хотя бы 1 подход, меньше = тюбик")
                return;
            }
            if (data.weight >= 500) {
                alert("Вы ненормальный столько жать? Введите вес меньше 500")
                return;
            }
            if (data.weight < 0) {
                alert("Вес должен быть положительным")
                return;
            }



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


            const currTraining = JSON.parse(localStorage.getItem(tableId));

            if (currTraining.length === 0) {
                alert("В тренировке должно быть хотя бы 1 упражнение")
                return;
            }

            const currTrainingData = {
                data: new Date().toISOString().split('T')[0],
                exercises: currTraining
            };

            trainingArray.push(currTrainingData);

            localStorage.setItem(calendarId, JSON.stringify(trainingArray));

            // Очистка текущей тренировки
            localStorage.setItem(tableId, JSON.stringify([]));

            // Отрисовка таблицы заново
            rerenderTable(tableElememntId);
            renderCalendar(calendarWrapperId)
        };

        currentTrainingContainer.append(submitButton);
    }


    // функция для показа тренировки в какой-то день
    const showTrainings = () => {

        const dayContainer = createElement("div", {
            classes: ["day-container"],
            attributes: {
                id: dayId
            },
            innerHTML: "some"
        })
        dayContainer.style.display = "none";


        const closeBtn = document.createElement("button");
        closeBtn.classList.add("close-btn");
        closeBtn.innerHTML = "Close"
        closeBtn.addEventListener("click", () => {
            hideDayContainer()
        });

        dayContainer.append(closeBtn);
        wrapper.append(dayContainer);
        renderDay("2025-02-10");

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
    showTrainings();


    addCss(cssFile)
}