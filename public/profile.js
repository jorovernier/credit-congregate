const loggedIn = true
// sessionStorage.setItem("username","jguac")

if(sessionStorage.getItem('username') === 'jguac'){
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
        let {user_id, first_name, last_name, username, email, password, bio, profile_pic, fico} = res.data[0]
        sideInfo.innerHTML = `
            <img id='prof-img' src=${profile_pic}/>
            <div id='disappear' class='dis'>
                <input id='prof-input' placeholder='New Image URL'/>
                <button id='edit-propic'>Save</button>
            </div>
            <div id='prof-info'>
                <div id='names-div'>
                    <hgroup id='prof-names'>
                        <h2 id='prof-flname'>${first_name} ${last_name}</h2>
                        <h1 id='prof-uname'>${username}</h1>
                    </hgroup>
                    <button id='probtn-${user_id}' class='edit-house pro-btn'><img title='Edit' id='proedit-${user_id}' class='edit-icon' src='./pics/edit.png'/></button>
                </div>
                <p id='prof-email'>${email}</p>
                <textarea disabled id='pronotes-${user_id}'>${bio}</textarea>
                <div>
                    <span>FICO Score: <h1 class='scooch'>${fico}</h1> </span>
                    <span>Total AF: <h1 id='total-af' class='scooch'></h1> </span>
                    <span>Total CL: <h1 id='total-cl' class='scooch'></h1> </span>
                </div>
                <p>Change Password</p>
            </div>
        `
        let disappear = document.getElementById('disappear')
        document.getElementById('prof-img').addEventListener('mouseover', () => {
            disappear.classList = 'appear'
        })
        disappear.addEventListener('mouseout', () => {
            disappear.classList = 'dis'
        })

        document.getElementById('edit-propic').addEventListener('click', () => {
            axios.put(`${base}/user/profile/pic/1`, {pic: document.getElementById('prof-input').value}).then(() => {
                getUserInfo()
            }).catch((err) => {
                if(err.response.data.length <= 40){
                    alert('Please remove the following characters from your entries: '+err.response.data.join(' '))
                } else {
                    alert(err.response.data)
                }
                getUserInfo()
            })
        })
        
        document.getElementById(`proedit-${user_id}`).addEventListener('click', (e) => {
            if(!editStatus){
                console.log(username)
                document.getElementById('prof-names').innerHTML = `
                    <div id='edit-names-div'>
                        <input id='edit-fname' value="${first_name}"/>
                        <input id='edit-lname' value="${last_name}"/>
                    </div>
                    <input id='edit-uname' value="${username}"/>
                `
                document.getElementById('prof-email').innerHTML = `
                    <input type='email' id='edit-email' value="${email}"/>
                `
                editTextArea(e, 'pro')
            } else {
                let bodyOdyOdy = {
                    firstName: document.getElementById('edit-fname').value,
                    lastName: document.getElementById('edit-lname').value,
                    username: document.getElementById('edit-uname').value,
                    email: document.getElementById('edit-email').value,
                    bio: document.getElementById(`pronotes-${user_id}`).value
                }
                sendChanges(bodyOdyOdy, user_id, 'profile')
            }
        })
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
            const {uc_id, apr, cl, nickname, cust_img, uses, card_name, bank_name, card_img, af} = res.data[i]
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
                <button id='rem-${uc_id}' class='remove'>X</button>
            `
            have.appendChild(haveCard)
            document.getElementById(`rem-${uc_id}`).addEventListener('click', () => {
                let param = `cards,uc,${uc_id}`
                axios.delete(`${base}/user/delete/${param}`).then(() => {
                    getUserInfo()
                })
            })

            document.getElementById(`hedit-${uc_id}`).addEventListener('click', (e) => {                
                if(!editStatus){
                    document.querySelector(`.bro-${uc_id}`).innerHTML = `<input class='have-input inp-big' id='himg-${uc_id}' placeholder='Leave blank for original image' value="${cust_img ? cust_img:card_img}"/>`
                    let haveSpans = document.querySelectorAll(`.have-span-${uc_id}`)
                    for(let i = 0; i < haveSpans.length; i++){
                        let text = haveSpans[i].childNodes[1].textContent
                        haveSpans[i].innerHTML = `<input class='have-input inp-small' id='hinp-${i}' value="${text}"/>`
                    }
                    document.getElementById(`hinp-0`).style.width = '100px'
                    editTextArea(e, 'h')
                } else {
                    let bodyOdyOdy = {
                        img: document.getElementById(`himg-${uc_id}`).value,
                        nickname: document.getElementById(`hinp-0`).value,
                        apr: document.getElementById(`hinp-1`).value,
                        limit: document.getElementById(`hinp-2`).value,
                        uses: document.getElementById(`hnotes-${uc_id}`).value
                    }
                    sendChanges(bodyOdyOdy, e.target.id.split('-')[1], 'haves')
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
                <button id='rem-${want_id}' class='remove'>X</button>
            `
            want.appendChild(wantCard)

            document.getElementById(`rem-${want_id}`).addEventListener('click', () => {
                let param = `wants,want,${want_id}`
                axios.delete(`${base}/user/delete/${param}`).then(() => {
                    getUserInfo()
                })
            })

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
            alert('Please remove the following characters from your entries: '+err.response.data.join(' '))
        } else {
            alert(err.response.data)
        }
        getUserInfo()
    })
}

getUserInfo()
} else {
    window.location.href = 'http://127.0.0.1:5500/public/index.html'
}