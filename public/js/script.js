document.querySelector(".input-number").addEventListener("keypress", function (evt) {
    if (evt.which != 8 && evt.which != 0 && evt.which < 48 || evt.which > 57)
    {
        evt.preventDefault();
    }
});

const a = document.getElementById('confirm-descuento');
const b = document.getElementById('descuento');
if (a.checked == true){
    b.disabled = false;
} else {
    b.disabled = true;
}

a.addEventListener("click", function(){
    if (a.checked == true){
        b.disabled = false;
    } else {
        b.disabled = true;
        b.value = '';
    }
})

const c = document.getElementById('cambiar-contraseña');
const d = document.getElementById('contraseña');
d.disabled = true;

c.addEventListener("click", function(){
    if (c.checked == true){
        d.disabled = false;
    } else {
        d.disabled = true;
    }
})
const e = document.getElementById('guardar')
e.addEventListener("click", function() {
    location.reload();
})
let arrow = document.querySelectorAll(".arrow");
  for (var i = 0; i < arrow.length; i++) {
    arrow[i].addEventListener("click", (e)=>{
   let arrowParent = e.target.parentElement.parentElement;//selecting main parent of arrow
   arrowParent.classList.toggle("showMenu");
    });
  }
  let sidebar = document.querySelector(".sidebar");
  let sidebarBtn = document.querySelector(".bx-menu");
  console.log(sidebarBtn);
  sidebarBtn.addEventListener("click", ()=>{
    sidebar.classList.toggle("close");
  });