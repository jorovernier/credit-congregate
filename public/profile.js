const base = 'http://localhost:6789'

const sideInfo = document.getElementById('prof-sec')
const have = document.getElementById('have')
const want = document.getElementById('want')

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
            // console.log(uses.join(', '))

            let haveCard = document.createElement('div')
            haveCard.setAttribute('id', `have-${uc_id}`)
            haveCard.classList.add('pc-card')

            haveCard.innerHTML = `
                <img class='pc-img' src='${cust_img ? cust_img:card_img}'/>
                <section class='title-info'>
                    <hgroup class='bank-title'>
                        <h2>${bank_name}</h2>
                        <h1>${card_name}</h1>
                    </hgroup>
                    <button class='edit-house'><img class='edit-icon' src='./pics/edit.png'/></button>
                </section>
                <div>
                    <span>Nickname: <h1 class='scooch'>${nickname}</h1> </span>
                </div>
                <section class='nums'>
                    <span>AF: <h1 class='scooch'>$${af}</h1> </span>
                    <span>APR: <h1 class='scooch'>${apr}%</h1> </span>
                    <span>Limit: <h1 class='scooch'>$${cl}</h1> </span>
                </section>
                <div>
                    <span>Uses: <h1 class='scooch'>${uses.join(', ')}</h1> </span> 
                </div>
                <button class='remove'>X</button>
            `
            have.appendChild(haveCard)
        }
        document.getElementById('total-af').textContent = `$${totalAF}`
        document.getElementById('total-cl').textContent = `$${totalCL}`
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
                    <button id='wbtn-${want_id}' class='edit-house'><img id='wedit-${want_id}' class='edit-icon' src='./pics/edit.png'/></button>
                </section>
                <textarea disabled id='wnotes-${want_id}' class='want-notes'>${notes}</textarea>
                <button class='remove'>X</button>
            `
            want.appendChild(wantCard)
            document.getElementById(`wedit-${want_id}`).addEventListener('click', (e) => {
                if(!editStatus){
                    editWantNotes(e)
                } else {
                    sendChanges(document.getElementById(`wnotes-${want_id}`).value, e.target.id.split('-')[1])
                }
            })
        }
    })
}

function editWantNotes(event) {
    editStatus = true
    let {id} = event.target
    document.getElementById(`wbtn-${id.split('-')[1]}`).classList = 'keep'
    let otherEdits = document.querySelectorAll('.edit-house')
    for(let i = 0; i < otherEdits.length; i++){
        otherEdits[i].style.display = 'none'
    }
    document.getElementById('wnotes-'+id.split('-')[1]).toggleAttribute('disabled')
    document.getElementById(`wedit-${id.split('-')[1]}`).setAttribute('src', './pics/save.png')
}
function sendChanges(newText, wantID) {
    editStatus = false
    axios.put(`${base}/user/wants/1`, {newText, wantID}).then(() => {
        reload()
    }).catch((err) => {
        if(err.response.data.length){
            alert('Please remove the following characters from your notes: '+err.response.data.join(' '))
        } else {
            alert("Your notes can't be longer than 62 characters!")
        }
        reload()
    })
}

function reload(){
    getUserInfo()
    getUserCards()
    getWantedCards()
}

reload()