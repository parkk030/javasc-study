async function getRequest() {

    try {
        const response = await fetch("http://localhost:8080/servlet_study_war_exploded/first");
        const responseData = await response.text();
        console.log(responseData);
    } catch (error) {
        console.log(error);
    }

}

getRequest();

function getRequest2(){
    fetch("http://localhost:8080/servlet_study_war_exploded/first")
    .then(response => {
        response.text()
            .then(responseData =>{
                console.log(responseData);
            })
    })

}

getRequest2();