// contact-reveal.js
// Reveal animation + attachment + textarea char counter (1000 max)

(() => {
  const section = document.getElementById('contact');
  if(section){
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          section.classList.add('contact-vp--revealed');
          observer.disconnect();
        }
      });
    }, { threshold:0.18 });
    observer.observe(section);
  }

  // Attachment
  const fileInput = document.getElementById('cf-attachment');
  const trigger = document.querySelector('[data-attach]');
  const nameOut = document.querySelector('[data-attach-name]');
  if(fileInput && trigger){
    trigger.addEventListener('click', ()=> fileInput.click());
    fileInput.addEventListener('change', ()=>{
      if(fileInput.files && fileInput.files[0]){
        nameOut.textContent = fileInput.files[0].name;
      } else {
        nameOut.textContent = "";
      }
    });
  }

  // Textarea character counter
  const textarea = document.getElementById('cf-message');
  const counter  = document.getElementById('cf-message-count');
  const MAX = 1000;

  function updateCount(){
    if(!textarea || !counter) return;
    const len = textarea.value.length;
    counter.textContent = `(${len} / ${MAX})`;

    counter.classList.remove('cf-count--warn', 'cf-count--limit');
    const pct = len / MAX;
    if(pct >= 1){
      counter.classList.add('cf-count--limit');
    } else if(pct >= 0.85){
      counter.classList.add('cf-count--warn');
    }
  }

  if(textarea){
    textarea.addEventListener('input', updateCount);
    updateCount();
  }
})();