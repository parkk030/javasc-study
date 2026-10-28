function main(){
    console.log("메인함수 호출");
    let student = {
        name: "일",
        age: 33,
        address: ["부산시", "부산진구","부암동",],
        address2: [
            {
                a1:"부산시"
            },
            {
                a2:"부산시"
            },
            {
                a3:"부산시"
            },
        ]
    };
    let student2 = 0/0;
    console.log(typeof student2)

    const PI = 3.14;
}

main();