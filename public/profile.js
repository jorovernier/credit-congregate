const base = 'http://localhost:6789'

const sideInfo = document.getElementById('prof-sec')
const have = document.getElementById('have')
const want = document.getElementById('want')

let lgog = document.getElementById('logo')
lgog.addEventListener('click', () => {
    axios.post(`${base}/seed`)
})

let editStatus = false

function getUserInfo(){
    axios.get(`${base}/user/1`).then((res) => {
        let {email, first_name, fico, last_name, password, profile_pic, user_id, username} = res.data[0]
        sideInfo.innerHTML = `
            <img id='prof-img' src=${profile_pic}/>
            <div id='prof-info'>
                <hgroup>
                    <h2>${first_name} ${last_name}</h2>
                    <h1>${username}</h1>
                </hgroup>
                <p>${email}</p>
                <div>
                    <span>FICO Score: <h1 class='scooch'>${fico}</h1> </span>
                    <span>Total AF: <h1 id='total-af' class='scooch'></h1> </span>
                    <span>Total CL: <h1 id='total-cl' class='scooch'></h1> </span>
                </div>
            </div>
        `
        getUserCards()
        getWantedCards()
    })
}

function getUserCards(){
    axios.get(`${base}/user/cards/1`).then((res) => {
        have.innerText = ''
        let totalAF = 0
        let totalCL = 0
        for(let i = 0; i < res.data.length; i++){
            const {af, apr, bank_name, card_img, card_name, cl, nickname, uc_id, uses, cust_img} = res.data[i]
            totalAF += af
            totalCL += cl

            let haveCard = document.createElement('div')
            haveCard.setAttribute('id', `have-${uc_id}`)
            haveCard.classList.add('pc-card')

            haveCard.innerHTML = `
                <div class='sup-bro bro-${uc_id}'>
                    <img class='pc-img' src='${cust_img ? cust_img:card_img}'/>
                </div>
                <section class='title-info'>
                    <hgroup class='bank-title'>
                        <h2>${bank_name}</h2>
                        <h1>${card_name}</h1>
                    </hgroup>
                    <button id='hbtn-${uc_id}' class='edit-house'><img id='hedit-${uc_id}' class='edit-icon' src='./pics/edit.png'/></button>
                </section>
                <div>
                    <span class='have-span-${uc_id}'>Nickname: <h1 class='scooch'>${nickname ? nickname:card_name}</h1> </span>
                </div>
                <section class='nums'>
                    <span>AF: <h1 class='scooch'>$${af}</h1> </span>
                    <span class='have-span-${uc_id}'>APR: <h1 class='scooch'>${apr ? apr:'--'}%</h1> </span>
                    <span class='have-span-${uc_id}'>Limit: <h1 class='scooch'>$${cl ? cl:'--'}</h1> </span>
                </section>
                <div class='span-ta'>
                    <span>Uses: <textarea disabled id='hnotes-${uc_id}' class='uses'>${uses}</textarea> </span> 
                </div>
                <button class='remove'>X</button>
            `
            have.appendChild(haveCard)

            document.getElementById(`hedit-${uc_id}`).addEventListener('click', (e) => {                
                if(!editStatus){
                    document.querySelector(`.bro-${uc_id}`).innerHTML = `<input class='have-input inp-big' id='himg-${uc_id}' placeholder='Leave blank for original image' value='${cust_img ? cust_img:card_img}'/>`
                    let haveSpans = document.querySelectorAll(`.have-span-${uc_id}`)
                    for(let i = 0; i < haveSpans.length; i++){
                        let text = haveSpans[i].childNodes[1].textContent
                        haveSpans[i].innerHTML = `<input class='have-input inp-small' id='hinp-${i}' value='${text}'/>`
                    }
                    document.getElementById(`hinp-0`).style.width = '100px'
                    editTextArea(e, 'h')
                } else {
                    let body = {
                        img: document.getElementById(`himg-${uc_id}`).value,
                        nickname: document.getElementById(`hinp-0`).value,
                        apr: document.getElementById(`hinp-1`).value,
                        limit: document.getElementById(`hinp-2`).value,
                        uses: document.getElementById(`hnotes-${uc_id}`).value
                    }
                    sendChanges(body, e.target.id.split('-')[1], 'haves')
                }
            })
            document.getElementById('total-af').textContent = `$${totalAF}`
            document.getElementById('total-cl').textContent = `$${totalCL}`
        }
    })
}

function getWantedCards() {
    axios.get(`${base}/user/wants/1`).then((res) => {
        want.innerText = ''
        for(let i = 0; i < res.data.length; i++){
            const {want_id, notes, card_name, bank_name, card_img} = res.data[i]

            let wantCard = document.createElement('div')
            wantCard.setAttribute('id', `want-${want_id}`)
            wantCard.classList.add('pc-card')

            wantCard.innerHTML = `
                <img class='pc-img' src='${card_img}'/>
                <section class='title-info'>
                    <hgroup class='bank-title'>
                        <h2>${bank_name}</h2>
                        <h1>${card_name}</h1>
                    </hgroup>
                    <button id='wbtn-${want_id}' class='edit-house'><img title='Edit' id='wedit-${want_id}' class='edit-icon' src='./pics/edit.png'/></button>
                </section>
                <textarea disabled id='wnotes-${want_id}' class='want-notes'>${notes}</textarea>
                <button class='remove'>X</button>
            `
            want.appendChild(wantCard)
            document.getElementById(`wedit-${want_id}`).addEventListener('click', (e) => {
                if(!editStatus){
                    editTextArea(e, 'w')
                } else {
                    sendChanges(document.getElementById(`wnotes-${want_id}`).value, e.target.id.split('-')[1], 'wants')
                }
            })
        }
    })
}

function editTextArea(e, prefix) {
    editStatus = true
    let id = e.target.id.split('-')[1]
    document.getElementById(`${prefix}btn-${id}`).classList = 'keep'
    let otherEdits = document.querySelectorAll('.edit-house')
    for(let i = 0; i < otherEdits.length; i++){
        otherEdits[i].style.display = 'none'
    }
    document.getElementById(`${prefix}notes-${id}`).toggleAttribute('disabled')
    document.getElementById(`${prefix}edit-${id}`).setAttribute('src', './pics/save.png')
}

function sendChanges(newText, itemID, endpoint) {
    editStatus = false
    axios.put(`${base}/user/${endpoint}/1`, {newText, itemID}).then(() => {
        getUserInfo()
    }).catch((err) => {
        if(err.response.data.length <= 40){
            alert('Please remove the following characters from your notes: '+err.response.data.join(' '))
        } else {
            alert(err.response.data)
        }
        getUserInfo()
    })
}

getUserInfo()