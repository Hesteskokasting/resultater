function e({role:e,labelledBy:t,describedBy:n,html:r}){let i=document.createElement(`div`);return i.className=`modal`,i.style.display=`none`,i.setAttribute(`role`,e),i.setAttribute(`aria-modal`,`true`),i.setAttribute(`aria-labelledby`,t),n&&i.setAttribute(`aria-describedby`,n),i.innerHTML=r,document.body.appendChild(i),i}function t(){let e=null,t=null;return{open(n,{focus:r,onEscape:i}){e=document.createElement(`div`),e.className=`modal-backdrop show`,document.body.appendChild(e),document.body.classList.add(`modal-open`),n.style.display=`block`,n.classList.add(`show`),r&&n.querySelector(r)?.focus(),t=e=>{e.key===`Escape`&&(e.preventDefault(),i())},document.addEventListener(`keydown`,t)},close(n){n.classList.remove(`show`),n.style.display=`none`,e?.remove(),e=null,document.body.classList.remove(`modal-open`),t&&=(document.removeEventListener(`keydown`,t),null)}}}var n=null,r=null,i=t();function a(){return n||(n=e({role:`alertdialog`,labelledBy:`cd-title`,describedBy:`cd-message`,html:`
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title" id="cd-title"></h5>
        </div>
        <div class="modal-body pt-2">
          <p class="mb-0" id="cd-message"></p>
        </div>
        <div class="modal-footer border-0 pt-0">
          <button type="button" class="btn btn-secondary" id="cd-cancel"></button>
          <button type="button" class="btn btn-primary" id="cd-confirm"></button>
        </div>
      </div>
    </div>
  `}),n.querySelector(`#cd-cancel`).addEventListener(`click`,()=>{o(!1)}),n.querySelector(`#cd-confirm`).addEventListener(`click`,()=>{o(!0)}),n)}function o(e){if(!n||!r)return;let t=r;r=null,i.close(n),t(e)}function s(e){let{title:t,message:n,confirmText:s=`OK`,cancelText:c=`Avbryt`,danger:l=!1}=e,u=a();u.querySelector(`#cd-title`).textContent=t,u.querySelector(`#cd-message`).textContent=n,u.querySelector(`#cd-cancel`).textContent=c;let d=u.querySelector(`#cd-confirm`);return d.textContent=s,d.className=`btn ${l?`btn-danger`:`btn-primary`}`,new Promise(e=>{r=e,i.open(u,{focus:`#cd-confirm`,onEscape:()=>{o(!1)}})})}export{e as n,t as r,s as t};