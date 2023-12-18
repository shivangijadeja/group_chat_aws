let my_form=document.querySelector('.login_form');

my_form.addEventListener('submit',loginUser);

async function loginUser(e){
    e.preventDefault();
    let u_email=document.querySelector('.u_email').value
    let u_pwd=document.querySelector('.u_pwd').value
    let user_exist=false;
    let user_password;

    let user={
        "email":u_email,
        "password":u_pwd
    }

    try{
        const get_users=await axios.get('/user/all-users')
        if(get_users.data.users.length>0){
            for(let i=0;i<get_users.data.users.length;i++){
                if(get_users.data.users[i].email===u_email){
                    user_exist=true
                    user_password=get_users.data.users[i].password
                }
            }
        }
    }
    catch(err){
        console.error(err)
    }
    if(user_exist)
    {
        try{
            const user_login=await axios.post('/user/login',user)
            localStorage.setItem('token',user_login.data.token)
            window.location.href = "/chat"
        }
        catch(err){
            console.error(err)
        }
        
    }
    else{
            const fetch_err=await axios.post('/user/login',user)
    }
}
