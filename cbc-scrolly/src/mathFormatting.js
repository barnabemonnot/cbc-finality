let math = document.getElementsByClassName('math');
for (var i = 0; i < math.length; i++) {
  katex.render(math[i].innerText, math[i]);
}
