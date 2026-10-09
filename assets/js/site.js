(()=>{
 'use strict';
 const byId=id=>document.getElementById(id);
 const nav=byId('primary-nav'),toggle=document.querySelector('.nav-toggle');
 const icon=toggle?.querySelector('use');
 const closeNav=()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open menu');icon?.setAttribute('href','#i-menu')};
 toggle?.addEventListener('click',()=>{const isOpen=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(isOpen));toggle.setAttribute('aria-label',isOpen?'Close menu':'Open menu');icon?.setAttribute('href',isOpen?'#i-x':'#i-menu')});
 nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeNav));
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeNav()});
 document.querySelectorAll('.service-open').forEach(btn=>btn.addEventListener('click',()=>{
   const s=byId('interest'); s.value=btn.dataset.service||'';
   byId('contact').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
   const status=byId('form-status'); status.textContent='Selected: '+s.value+'. Please complete your enquiry details.';
 }));
 const observerSupported=('IntersectionObserver' in window) && !matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(observerSupported){const items=document.querySelectorAll('[data-reveal]');const io=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}})},{rootMargin:'0px 0px 40px 0px',threshold:.06});items.forEach(x=>io.observe(x));requestAnimationFrame(()=>document.body.classList.add('js-motion'))}
 byId('year').textContent=new Date().getFullYear();
 const form=byId('quote-form'),status=byId('form-status');
 const error=msg=>{status.textContent=msg;status.scrollIntoView({block:'nearest'});};
 const config=window.SOLAR_SITE_CONFIG||{};
 form.addEventListener('submit',async e=>{
   e.preventDefault();
   const fields=['name','phone','email','suburb','service'];
   fields.forEach(key=>form.elements.namedItem(key)?.classList.remove('invalid'));
   let firstInvalid=null;
   for(const key of fields){const el=form.elements.namedItem(key);if(!el.value.trim()||key==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim())){el.classList.add('invalid');firstInvalid??=el}}
   if(firstInvalid){firstInvalid.focus();error('Please complete all required fields and enter a valid email address.');return}
   const payload=Object.fromEntries(new FormData(form).entries());
   const endpoint=(config.formEndpoint||'').trim(),recipient=(config.emailRecipient||'').trim();
   if(endpoint){
     if(!/^https:\/\//i.test(endpoint)){error('The form endpoint must be an HTTPS URL.');return}
     const button=form.querySelector('button[type="submit"]');button.disabled=true;status.textContent='Sending your enquiry…';
     try{const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload)});if(!res.ok)throw new Error('Delivery failed');status.textContent='Thanks! Your enquiry was sent. We will be in touch.';form.reset()}catch(err){error('Your enquiry could not be sent. Please try again or contact the business directly.')}finally{button.disabled=false}
     return;
   }
   if(recipient&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)){
     const subject='Solar enquiry: '+payload.service+' — '+payload.suburb;
     const body=['Name: '+payload.name,'Phone: '+payload.phone,'Email: '+payload.email,'Suburb/postcode: '+payload.suburb,'Service: '+payload.service,'','Project details: '+(payload.message||'Not provided')].join('\n');
     status.textContent='Opening your email app with a pre-filled enquiry. Please press Send in your email app to finish.';
     location.href='mailto:'+encodeURIComponent(recipient)+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);return;
   }
   error('Demo form: enquiry delivery has not yet been connected. The website owner must set an email or HTTPS endpoint in assets/js/config.js before launch. No enquiry has been sent.');
 });
})();
