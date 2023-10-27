const base = 'http://localhost:6789'

const sideInfo = document.getElementById('prof-sec')
const have = document.getElementById('have')

function getUserInfo(){
    axios.get(`${base}/users/1`).then((res) => {
        let {email, first_name, fico, last_name, password, profile_pic, user_id, username} = res.data[0]
        sideInfo.innerHTML = `
            <img id="prof-img" src=${profile_pic}/>
            <h2>${first_name} ${last_name}</h2>
            <h1>${username}</h1>
            <p>FICO Score: ${fico}</p>
            <section>
                Hidden Section:
                <p>${email}</p>
                <p>${password}</p>
            </section>
        `
    })
}

function getUserCards(){
    axios.get(`${base}/user/1`).then((res) => {
        console.log(res.data)
        have.innerText = ''
        for(let i = 0; i < res.data.length; i++){
            const {af, apr, bank_name, card_img, card_name, cl, nickname, uc_id, uses} = res.data[i]

            let haveCard = document.createElement('div')
            haveCard.setAttribute('id', `have-${uc_id}`)
            haveCard.classList.add('have-card')

            haveCard.innerHTML = `
                <img class='have-img' src='${card_img}'/>
                <section class='title-info'>
                    <hgroup class='bank-title'>
                        <h2>${bank_name}</h2>
                        <h1>${card_name}</h1>
                    </hgroup>
                    <button>E</button>
                </section>
                <div>
                    <span>Nickname: <h1 class='scooch'>${nickname}</h1> </span>
                </div>
                <section class='nums'>
                    <span>AF: <h1 class='scooch'>$${af}</h1> </span>
                    <span>APR: <h1 class='scooch'>${apr}%</h1> </span>
                    <span>Limit: <h1 class='scooch'>$${cl}</h1> </span>
                </section>
            `

            have.appendChild(haveCard)
            // document.getElementById(`${card_id}`).addEventListener('click', getMoreInfo)
        }
    })
}

getUserInfo()
getUserCards()