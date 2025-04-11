const noteTitleInput = document.getElementById('noteTitle'); //Traer elementos de DOM por su id para poder usarlos
const noteContentInput = document.getElementById('noteContent');
const noteCategorySelect = document.getElementById('noteCategory');
const addNoteButton = document.getElementById('addNote');
const deleteAllButton = document.getElementById('deleteAllNotes');
const notesTableBody = document.getElementById('notesTableBody');
let currentPage = 1; //Variable de paginación actual
const notesPerPage = 5; //Cuantas notas mostrar por página

let notes = JSON.parse(localStorage.getItem('notes')) || []; // Recuperamos las notas desde el almacenamiento local (localStorage).Si no hay nada guardado, iniciamos un arreglo vacío ([]).
let editingIndex = null; //Se usa para saber si el usuario está editando una nota existente, si es null es una nota nueva

//Mostrar notas en la tabla (Paginadas)
function displayNotes() {
    notesTableBody.innerHTML = ''; //Limpia el contenido actual de la tabla  (tbody) antes de mostrar nuevas filas
  
    const startIndex = (currentPage - 1) * notesPerPage; //calcula el indice de inicio
    const endIndex = startIndex + notesPerPage; // calcula el indice de fin según la pagina actual
    const paginatedNotes = notes.slice(startIndex, endIndex); //slice (...) obtiene solo las notas de esa página
  
    paginatedNotes.forEach((note, index) => { //recorre cada nota
      const row = document.createElement('tr'); //crea una fila HTML
    
      //creacion del contenido HTML de la fila (título, contenido, categoria, fecha, botones editar y eliminar)
      row.innerHTML = `
        <td>${note.title}</td>
        <td>${note.content}</td>
        <td>${note.category}</td>
        <td>${note.date}</td>
        <td>
          <button class="btn btn-sm btn-success edit-note" data-index="${startIndex + index}">Editar</button>
          <button class="btn btn-sm btn-danger delete-note" data-index="${startIndex + index}">Eliminar</button>
        </td>
      `;
  
      notesTableBody.appendChild(row); //agrega la fila al tbody
    });
  
    // Actualizar paginación
    document.getElementById('pageIndicator').innerText = `Página ${currentPage}`; //actualiza el numero de pagina mostrado
    document.getElementById('prevPage').disabled = currentPage === 1; //Desactiva el botón anterior si ya está en la página 1
    document.getElementById('nextPage').disabled = endIndex >= notes.length; //desactiva el botón siguiente si no hay mas notas para mostrar
  }

//Botones de paginación
document.getElementById('prevPage').addEventListener('click', () => { //Selecciona el botón anterior
    if (currentPage > 1) { //Verifica que no este en la primera pagina - Si es mayor a 1 significa que puede retroceder
      currentPage--; //resta 1 al número de página actual para ir a la página anterior.
      displayNotes();//Actualiza las notas visibles con la pagina anterior
    }
});
  
document.getElementById('nextPage').addEventListener('click', () => { //Seleciona botón siguiente
    if ((currentPage * notesPerPage) < notes.length) { //currentPage*notesperpage es la cantidad de notas que ya se han ostrado hasta esta pagina- si este valor es menor que el total notas (notes.length) hay mas para mostrar
      currentPage++; //Incrementa la página actual en 1 para ir a la siguiente
      displayNotes(); //muestra las nuevas notas correspondientes a la nueva pagina
    }
});
  
/*convierte el arreglo notes en JSON y lo guarda con la clave 'notes'
localStorage es una API del navegador que permite almacenar datos de forma persistente (aunque cierres el navegador).
.setItem() se usa para guardar un dato. Recibe dos parámetros:
La clave bajo la cual guardará el dato (en este caso: 'notes')
El valor a guardar (en este caso: las notas)
Por eso se usa JSON.stringify() para convertir el array a una cadena de texto en formato JSON.
*/
function saveNotes() {
  localStorage.setItem('notes', JSON.stringify(notes));
}

//Agregar o editar nota
addNoteButton.addEventListener('click', () => { //se ejecuta cuando se hace click en agregar nota
  //Obtener los valores de los campos del formulario
  const title = noteTitleInput.value.trim(); //trim elimina los campos vacios al principio / final
  const content = noteContentInput.value.trim();
  const category = noteCategorySelect.value;
  const date = new Date().toLocaleDateString();

  if (title === '' || content === '' || category === '') { //Validación de que ningún campo esté vacio
    Swal.fire('Campos incompletos', 'Complete todos los campos y seleccione una categoría.', 'warning'); //si hay alguno vacio muestra SweetAlert
    return; //detiene la ejecición: no se guarda nada si falta un dato
  }

  if (editingIndex !== null) { //Si editingIndex tiene un valor distinto de null es porque se está editando una nota existente
    notes[editingIndex] = { title, content, category, date }; //reemplaza la nota en el arreglo notes en la posición editingIndex
    editingIndex = null; //Se reinicia editingIndex a null para salir del modo edición.
    Swal.fire('Editado', 'La nota fue actualizada exitosamente.', 'success'); //muestra un mensaje de éxito con SweetAlert.
  } else { //Sí es nueva
    notes.push({ title, content, category, date }); //Se agrega una nueva nota al final del array notes.
    Swal.fire('Agregada', 'La nota fue agregada exitosamente.', 'success'); //muestra una alerta de éxito.
  }

  saveNotes(); //Guarda en el localStorage
  currentPage = 1; //Reinicia pagina 1
  displayNotes(); //Vuelve a mostrar la tabla con las nuevas notas

  //Limpia los campos del formulario para ingresar una nueva nota
  noteTitleInput.value = '';
  noteContentInput.value = '';
  noteCategorySelect.value = '';
});

// Editar y eliminar una nota individual
notesTableBody.addEventListener('click', (event) => { //Clicks dentro de la tabla
  const index = event.target.dataset.index; //Obtine el indice de la nota desde data-index
  /* event.target es el elemento en el que se hizo click
  .dataset.index accede al atributo data-index del botón que contiene la posicion (indice) de la nota dentro del array notes*/
  if (event.target.classList.contains('delete-note')) { //Si se hace click en eliminar muestra SweetAlert
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta nota se eliminará permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        notes.splice(index, 1);// si se confirma eliminar, borra la nota del array
        //.splice(index, 1) elimina 1 elemnto en la posición index
        saveNotes(); //Guarda cambios en localStorge
        currentPage = 1; //vuelve a pagina 1
        displayNotes(); //actualiza tabla de notas
        Swal.fire('Eliminada', 'La nota fue eliminada.', 'success'); //muestra confirmación
      }
    });
  }

  if (event.target.classList.contains('edit-note')) { //llena el formulario con los datos de la nota
    const note = notes[index]; //se accede a la nota en el array usnado index
    //Se llenan los campos del formulario con los datos de esa nota
    noteTitleInput.value = note.title;
    noteContentInput.value = note.content;
    noteCategorySelect.value = note.category;
    editingIndex = index; //Se guarda el índice en editingIndex para saber que está en modo edición, no agregando una nueva nota.
  }
});

//Eliminar todas las notas
deleteAllButton.addEventListener('click', () => {
  if (notes.length === 0) { //Sí el array notas está vacio
    Swal.fire('No hay notas', 'No hay notas para eliminar.', 'info'); //Muestra que nohay notas para eliminar
    return; //Detiene la ejecución del código
  }

  Swal.fire({ //Si hay notas muestra confirmación con SweetAlert
    title: '¿Eliminar todas las notas?',
    text: 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true, //permite cancelar la acción
    confirmButtonText: 'Sí, eliminar todas',
    cancelButtonText: 'Cancelar'
  }).then((result) => { //.then(..) se ejecuta cuando se responde a la alerta
    if (result.isConfirmed) {
      notes = []; //Borra todas la notas del array
      saveNotes(); 
      currentPage = 1;
      displayNotes();
      Swal.fire('Eliminadas', 'Todas las notas fueron eliminadas.', 'success'); //Alerta de confirmación de eliminación
    }
  });
});

displayNotes();

