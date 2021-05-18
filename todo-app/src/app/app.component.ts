import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'todo-app';
  newTodoValue = '';
  displayedList = new Array(); // list currently displayed
  todosList = new Array(); // list of all todos
  todoChecked = false;
  currentState = 'all';
  currentText = '';
  darktheme = false;
  draggeddiv = document.createElement('div');
  currentStr: HTMLElement = document.children[0] as HTMLElement; // element containing the value of the todo
  isOnDrag = false;
  pointedElement: HTMLElement = document.children[0] as HTMLElement; // element pointing by cursor during drag & drop
  initialX = 0;
  initialY = 0;
  ACTIVE = 'active';
  COMPLETED = 'completed';
  hasListBeenSwapped = false; // check if there are swapped elements in todos list
  //todo circle svg
  todoCircleStr =
    '<svg style="justify-self:center;align-self:center"' +
    'xmlns="http://www.w3.org/2000/svg" width="50%" height="50%">' +
    '<defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="50%">' +
    '<stop offset="0%" style="stop-color: hsl(192, 100%, 67%); stop-opacity: 1"/>' +
    '<stop offset="100%" style="stop-color: hsl(280, 87%, 65%); stop-opacity: 1"/> </linearGradient>' +
    '</defs><a href="#"><circle cx="50%" cy="45%" r="11" stroke=' +
    (this.darktheme ? '"hsl(237, 14%, 26%)"' : '"hsl(236, 33%, 92%)"') +
    'fill="#ffffff00"></circle>' +
    '<image style="visibility:hidden" x="37%" y="35%" width="11" height="9" href="../assets/icon-check.svg" /></a></svg>';

  handleCheck(target: HTMLElement, fromstr: boolean): void {
    //draw a line through the todo text of target (the target can be either the circle or the todo text itself)
    const tolinethrough = fromstr
      ? (target.parentNode as HTMLElement)
      : (
          (
            ((target.parentNode as HTMLElement).parentNode as HTMLElement)
              .parentNode as HTMLElement
          ).parentNode as HTMLElement
        ).children[1];
    tolinethrough.classList.toggle('checkedtodo');
    this.displayedList.map((todo) => {
      if (todo.id === Number.parseInt(tolinethrough.id)) {
        todo.done = !todo.done;
      }
    });
    // check if the whole todo node is an initial todo (that we can write)
    if (
      (
        target.parentNode?.parentNode?.parentNode?.parentNode as HTMLElement
      ).className.includes('initialtodo')
    ) {
      this.todoChecked = !this.todoChecked;
    }
    this.refreshtodos();
    const circleOrTickFromStrParent =
      target.parentNode?.parentNode?.children[0].children[0].children[1];
    const circle = (
      fromstr
        ? circleOrTickFromStrParent?.children[0]
        : target.parentNode?.children[0]
    ) as HTMLElement;
    const tick = fromstr
      ? (circleOrTickFromStrParent?.children[1] as HTMLElement)
      : ((target.parentNode as HTMLElement).children[1] as HTMLElement);
    const setCircleColorAndTickVisibility = (
      color: string,
      visibility: string
    ) => {
      circle.setAttribute('fill', color);
      tick.style.visibility = visibility;
    };
    //fill/unfill the circle and make the tick appear/disappear when clicked
    if (circle.getAttribute('fill') === '#ffffff00') {
      setCircleColorAndTickVisibility('url(#grad)', 'visible');
    } else {
      setCircleColorAndTickVisibility('#ffffff00', 'hidden');
    }
  }

  handleMouseOverTodo(target: HTMLElement, fromstr: boolean) {
    const setVisibility = (visibleStr: string, target: HTMLElement) => {
      (fromstr
        ? (target.parentNode?.parentNode?.children[2]
            .children[0] as HTMLElement)
        : <HTMLElement>target.children[0]
      ).style.visibility = visibleStr;
    };
    //make the cross appear when mouse is over the todo
    target.onmouseover = (event) => {
      const target = <HTMLElement>event.target;
      setVisibility('visible', target);
    };
    //make the cross disappear when mouse is not over the todo
    target.onmouseout = (event) => {
      const target = <HTMLElement>event.target;
      setVisibility('hidden', target);
    };
    target.onclick = (event) => {
      const target = <HTMLElement>event.target;
      //if we click on the todo text
      if (fromstr) {
        //check the todo
        this.handleCheck(target, true);
        // if we click on the todo cross
      } else {
        //deletion
        this.todosList = this.todosList.filter(
          (todo) => todo.id.toString() !== target.parentNode?.children[1].id
        );
        if (this.hasListBeenSwapped) {
          this.displayedList = this.displayedList.filter(
            (todo) => todo.id.toString() !== target.parentNode?.children[1].id
          );
        }
        this.refreshtodos();
      }
    };
  }

  addCheckCircle(className: string): void {
    document.querySelectorAll('.' + className).forEach((checknode) => {
      // adds check circle and creates a line through the todo text on click in the circle
      if (checknode.innerHTML === '') {
        checknode.innerHTML = this.todoCircleStr;
        setTimeout(() => {
          (checknode.children[0] as HTMLElement).onclick = (evt) => {
            const target = <HTMLElement>evt.target;
            this.handleCheck(target, false);
          };
          const checkCircle = checknode.children[0].children[1]
            .children[0] as HTMLElement;
          checkCircle.onmouseover = (evt) => {
            const target = <HTMLElement>evt.target;
            target.setAttribute('stroke', 'url(#grad)');
          };
          checkCircle.onmouseout = (evt) => {
            const target = <HTMLElement>evt.target;
            target.setAttribute(
              'stroke',
              this.darktheme ? 'hsl(237, 14%, 26%)' : 'hsl(236, 33%, 92%)'
            );
          };
        }, 50);
      }
      setTimeout(() => this.refreshIds(), 60);
      setTimeout(() => {
        const todostr = <HTMLElement>(
          (checknode.parentNode as HTMLElement).children[1]
        );
        const todo = this.displayedList.find(
          (todo) => todo.id === Number.parseInt(todostr.id)
        );
        if (todo && todo.done) {
          checknode.children[0].children[1].children[0].setAttribute(
            'fill',
            'url(#grad)'
          );
          (
            checknode.children[0].children[1].children[1] as HTMLElement
          ).style.visibility = 'visible';
          todostr.classList.add('checkedtodo');
        }
      }, 70);
    });
  }

  addCircleAndDarkTheme() {
    this.addCheckCircle('ischecked');
    document.querySelectorAll('.createtodo.newtodo').forEach((ct) => {
      ct.classList.add(this.darktheme ? 'dark-theme' : 'light-theme');
    });
    document.querySelectorAll('.innerstr').forEach((i) => {
      i.classList.add(this.darktheme ? 'dark-theme' : 'light-theme');
    });
  }

  addCircleStroke() {
    document.querySelectorAll('.createtodo').forEach((ct) => {
      ct.children[0].children[0].children[1].children[0].setAttribute(
        'stroke',
        this.darktheme ? 'hsl(237, 14%, 26%)' : 'hsl(236, 33%, 92%)'
      );
    });
  }

  select(elementindex: number, infoelements: HTMLElement[]): void {
    infoelements.forEach((elem, index) => {
      const elemclassname = elem.className;
      const elemclasslist = elem.classList;
      if (index === elementindex && !elemclassname.includes('infoselected')) {
        elemclasslist.add('infoselected');
      } else if (
        index !== elementindex &&
        elemclassname.includes('infoselected')
      ) {
        elemclasslist.remove('infoselected');
      }
    });
    switch (elementindex) {
      case 1:
        this.currentState = 'active';
        this.displayedList = this.todosList.filter((todo) => !todo.done);
        break;
      case 2:
        this.currentState = 'completed';
        this.displayedList = this.todosList.filter((todo) => todo.done);
        break;
      default:
        this.currentState = 'all';
        this.displayedList = this.todosList;
    }
    setTimeout(() => {
      this.addCircleAndDarkTheme();
    }, 50);
    setTimeout(() => {
      this.addCircleStroke();
      this.addDragAndDrop();
    }, 70);
  }

  addDragAndDrop(): void {
    document.querySelectorAll('.createtodo.newtodo').forEach((ct) => {
      const wholetodo = <HTMLElement>ct;
      const isCheckedDiv = wholetodo.children[0] as HTMLElement;
      isCheckedDiv.onmousedown = (evt) => {
        const target = <HTMLElement>evt.target;
        const todostr = target.parentNode?.children[1] as HTMLElement;
        if (!this.isOnDrag) {
          this.currentStr = todostr;
          this.isOnDrag = true;
          this.draggeddiv.style.position = 'fixed';
          this.draggeddiv.style.width = '45%';
          this.draggeddiv.style.height = '55px';
          this.draggeddiv.style.display = 'grid';
          this.draggeddiv.style.gridTemplateColumns = '15% 85%';
          this.draggeddiv.style.backgroundColor = this.darktheme
            ? 'hsl(235, 24%, 19%)'
            : '#ffffff';
          this.draggeddiv.style.top = evt.clientY.toString() + 'px';
          this.draggeddiv.style.left = evt.clientX.toString() + 'px';
          const draggedchecked = document.createElement('div') as HTMLElement;
          draggedchecked.style.height = '55px';
          draggedchecked.style.display = 'grid';
          draggedchecked.innerHTML = this.todoCircleStr;
          const draggedp = document.createElement('p') as HTMLElement;
          draggedp.style.height = '22px';
          draggedp.style.color = this.darktheme
            ? '#ffffff'
            : 'hsl(235, 24%, 19%)';
          draggedp.style.fontFamily = 'Josefin Sans';
          draggedp.style.fontWeight = '400';
          draggedp.style.fontSize = '18px';
          draggedp.style.alignSelf = 'center';
          const draggedtext = document.createTextNode(
            todostr.children[0].innerHTML
          );
          draggedp.appendChild(draggedtext);
          this.draggeddiv.appendChild(draggedchecked);
          this.draggeddiv.appendChild(draggedp);
          this.initialX = evt.clientX;
          this.initialY = evt.clientY;
          (document.querySelector('.wholepage') as HTMLElement).appendChild(
            this.draggeddiv
          );
          todostr.children[0].innerHTML = '';
        }
        return false;
      };

      document.body.onmousemove = (evt) => {
        if (this.isOnDrag) {
          const cursorElement = document.elementFromPoint(
            evt.clientX,
            evt.clientY
          ) as HTMLElement;
          if (
            this.pointedElement.parentNode &&
            (((this.pointedElement.parentNode as HTMLElement).className &&
              (
                this.pointedElement.parentNode as HTMLElement
              ).className.includes('newtodo')) ||
              (this.pointedElement &&
                (this.pointedElement as HTMLElement).className &&
                (this.pointedElement as HTMLElement).className.includes(
                  'newtodo'
                ) &&
                (this.pointedElement.className !== cursorElement.className ||
                  this.pointedElement.children[1]?.id !==
                    cursorElement.children[1]?.id ||
                  this.pointedElement.parentNode?.children[1].id !==
                    cursorElement.parentNode?.children[1].id)))
          ) {
            const toChange = (
              this.pointedElement as HTMLElement
            ).className.includes('newtodo')
              ? this.pointedElement
              : this.pointedElement.parentNode;
            (toChange as HTMLElement).style.backgroundColor = this.darktheme
              ? 'hsl(235, 24%, 19%)'
              : '#ffffff';
          }
          if (
            (cursorElement.parentNode &&
              (cursorElement.parentNode as HTMLElement).className &&
              (cursorElement.parentNode as HTMLElement).className.includes(
                'newtodo'
              )) ||
            (cursorElement &&
              cursorElement.className &&
              cursorElement.className.includes('newtodo'))
          ) {
            this.pointedElement = cursorElement;
            const toChange = (cursorElement as HTMLElement).className.includes(
              'newtodo'
            )
              ? cursorElement
              : cursorElement.parentNode;
            (toChange as HTMLElement).style.backgroundColor = '#0000ff';
          }
          this.draggeddiv.style.top =
            (this.initialY + (evt.clientY - this.initialY)).toString() + 'px';
          this.draggeddiv.style.left =
            (this.initialX + (evt.clientX - this.initialX)).toString() + 'px';
        }
      };

      document.body.onmouseup = (evt) => {
        let isSwapped = false;
        this.isOnDrag = false;
        this.draggeddiv.remove();
        this.draggeddiv = document.createElement('div');
        const cursorElement = document.elementFromPoint(
          evt.clientX,
          evt.clientY
        ) as HTMLElement;
        if (
          cursorElement.parentNode &&
          (cursorElement.parentNode as HTMLElement).className &&
          ((cursorElement.parentNode as HTMLElement).className.includes(
            'newtodo'
          ) ||
            (cursorElement &&
              cursorElement.className &&
              cursorElement.className.includes('newtodo')))
        ) {
          const current = cursorElement.className.includes('newtodo')
            ? cursorElement.children[1]
            : cursorElement.parentNode?.children[1];
          if (this.currentStr && current) {
            const currentTodo = this.displayedList.filter(
              (todo) => todo.id.toString() === current.id
            )[0];
            const invertTodo = this.displayedList.filter(
              (todo) => todo.id.toString() === this.currentStr.id
            )[0];
            if (currentTodo.id !== invertTodo.id) {
              this.hasListBeenSwapped = true;
              this.displayedList = this.displayedList.map((todo) => {
                if (todo.id === invertTodo.id) {
                  todo = Object.assign({}, invertTodo, {
                    value: currentTodo.value,
                    done: currentTodo.done,
                  });
                } else if (todo.id === currentTodo.id) {
                  todo = Object.assign({}, currentTodo, {
                    value: invertTodo.value,
                    done: invertTodo.done,
                  });
                }
                isSwapped = true;
                return todo;
              });
            }
            this.refreshtodos();
          }
        }
        if (!isSwapped) {
          // replace todostr by its old value
          this.currentStr.children[0].innerHTML = this.displayedList.filter(
            (todo) => {
              return todo.id === Number.parseInt(this.currentStr.id);
            }
          )[0].value;
        }
      };
    });
  }

  refreshtodos(): void {
    switch (this.currentState) {
      case this.ACTIVE:
        this.displayedList = this.todosList.filter((todo) => !todo.done);
        break;
      case this.COMPLETED:
        this.displayedList = this.todosList.filter((todo) => todo.done);
        break;
      default:
        if (!this.hasListBeenSwapped) {
          this.displayedList = this.todosList;
        }
    }
    setTimeout(() => {
      this.addCircleAndDarkTheme();
    }, 50);
    setTimeout(() => {
      this.addCircleStroke();
      this.addDragAndDrop();
    }, 70);
  }

  refreshIds(): void {
    this.displayedList.map((todo, index) => {
      todo.id = index + 1;
      return todo;
    });
    switch (this.currentState) {
      case this.ACTIVE:
        this.todosList
          .filter((todo) => !todo.done)
          .map((t, index) => (t.id = index + 1));
        // replace id of done todos with 0
        this.todosList.filter((todo) => todo.done).map((t) => (t.id = 0));
        break;
      case this.COMPLETED:
        this.todosList
          .filter((todo) => todo.done)
          .map((t, index) => (t.id = index + 1));
        // replace id of active todos with 0
        this.todosList.filter((todo) => !todo.done).map((t) => (t.id = 0));
        break;
      default:
        if (this.hasListBeenSwapped) {
          this.todosList = [...this.displayedList];
        } else {
          this.todosList.map((t, index) => (t.id = index + 1));
        }
    }
    document
      .querySelectorAll('.createtodo.newtodo .todostr')
      .forEach((todostr, key) => {
        (<HTMLElement>todostr).id = (key + 1).toString();
        this.handleMouseOverTodo(<HTMLElement>todostr, true);
        this.handleMouseOverTodo(
          <HTMLElement>todostr.parentNode?.children[2],
          false
        );
      });
  }

  resetTodosBackground() {
    document.querySelectorAll('.newtodo').forEach((todo) => {
      (todo as HTMLElement).style.backgroundColor = this.darktheme
        ? 'hsl(235, 24%, 19%)'
        : '#ffffff';
    });
  }

  switchClassMode(className: string) {
    document.querySelectorAll(`.${className}`).forEach((ct) => {
      ct.classList.toggle('light-theme');
      ct.classList.toggle('dark-theme');
    });
  }

  ngOnInit(): void {
    this.addCheckCircle('ischecked');
    (
      document.querySelector('.createtodoinput') as HTMLElement
    ).addEventListener('keydown', (event) => {
      if (this.newTodoValue !== '' && event.key === 'Enter') {
        this.todosList.push({
          id: 0,
          value: this.newTodoValue,
          done: this.todoChecked,
        });
        if (this.hasListBeenSwapped) {
          this.displayedList.push({
            id: 0,
            value: this.newTodoValue,
            done: this.todoChecked,
          });
        }
        setTimeout(() => {
          this.refreshtodos();
        }, 50);
      }
    });

    const infoall = document.querySelector('.todosinfo .all') as HTMLElement;
    const infoactive = document.querySelector(
      '.todosinfo .activetodos'
    ) as HTMLElement;
    const infocompleted = document.querySelector(
      '.todosinfo .completed'
    ) as HTMLElement;

    (document.querySelector('.title .icon') as HTMLElement).addEventListener(
      'click',
      () => {
        this.darktheme = !this.darktheme;
        this.resetTodosBackground();
        document.querySelectorAll('.createtodo').forEach((ct) => {
          ct.children[0].children[0].children[1].children[0].setAttribute(
            'stroke',
            this.darktheme ? 'hsl(237, 14%, 26%)' : 'hsl(236, 33%, 92%)'
          );
        });
        this.switchClassMode('createtodo');
        this.switchClassMode('todolist');
        this.switchClassMode('innerstr');
        this.switchClassMode('wholepage');
        this.switchClassMode('cleartxt');
        infoall.classList.toggle('light-theme');
        infoall.classList.toggle('dark-theme');
        infoactive.classList.toggle('light-theme');
        infoactive.classList.toggle('dark-theme');
        infocompleted.classList.toggle('light-theme');
        infocompleted.classList.toggle('dark-theme');
        (
          document.querySelector('.createtodoinput') as HTMLElement
        ).classList.toggle('light-theme');
        (
          document.querySelector('.createtodoinput') as HTMLElement
        ).classList.toggle('dark-theme');
        (document.querySelector('.todosinfo') as HTMLElement).classList.toggle(
          'light-theme'
        );
        (document.querySelector('.todosinfo') as HTMLElement).classList.toggle(
          'dark-theme'
        );
      }
    );

    const infoelements = [infoall, infoactive, infocompleted];

    infoall.addEventListener('click', () => this.select(0, infoelements));
    infoactive.addEventListener('click', () => this.select(1, infoelements));
    infocompleted.addEventListener('click', () => this.select(2, infoelements));

    (document.querySelector('.cleartodos') as HTMLElement).addEventListener(
      'click',
      () => {
        this.todosList = this.todosList.filter((todo) => !todo.done);
        if (this.hasListBeenSwapped) {
          this.displayedList = this.displayedList.filter((todo) => !todo.done);
        }
        setTimeout(() => this.refreshtodos(), 50);
      }
    );
  }
}
