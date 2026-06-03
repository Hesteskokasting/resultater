var e=null,t=null,n=null,r=null;function i(){return e||(e=document.createElement(`div`),e.className=`modal`,e.style.display=`none`,e.setAttribute(`role`,`alertdialog`),e.setAttribute(`aria-modal`,`true`),e.setAttribute(`aria-labelledby`,`cd-title`),e.setAttribute(`aria-describedby`,`cd-message`),e.innerHTML=`
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
  `,document.body.appendChild(e),e.querySelector(`#cd-cancel`).addEventListener(`click`,()=>{s(!1)}),e.querySelector(`#cd-confirm`).addEventListener(`click`,()=>{s(!0)}),e)}function a(e){t=document.createElement(`div`),t.className=`modal-backdrop show`,document.body.appendChild(t),document.body.classList.add(`modal-open`),e.style.display=`block`,e.classList.add(`show`),e.querySelector(`#cd-confirm`)?.focus(),r=e=>{e.key===`Escape`&&(e.preventDefault(),s(!1))},document.addEventListener(`keydown`,r)}function o(e){e.classList.remove(`show`),e.style.display=`none`,t?.remove(),t=null,document.body.classList.remove(`modal-open`),r&&=(document.removeEventListener(`keydown`,r),null)}function s(t){if(!e||!n)return;let r=n;n=null,o(e),r(t)}function c(e){let{title:t,message:r,confirmText:o=`OK`,cancelText:s=`Avbryt`,danger:c=!1}=e,l=i();l.querySelector(`#cd-title`).textContent=t,l.querySelector(`#cd-message`).textContent=r,l.querySelector(`#cd-cancel`).textContent=s;let u=l.querySelector(`#cd-confirm`);return u.textContent=o,u.className=`btn ${c?`btn-danger`:`btn-primary`}`,new Promise(e=>{n=e,a(l)})}export{c as t};