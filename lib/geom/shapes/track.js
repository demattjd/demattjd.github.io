var generateTrackData = function(x, z, fileData , scale) {

    //Set the radius and number of slices (triangles)
    var s = scale;

    //Array to hold points
    let p=[];

    let n=[];

    var max = fileData.length - 20;

    var i=0;

    while(i<=max){
        p.push(fileData[i+x]*s,0,fileData[i+z]*s);
        n.push(0,1,0);
        i=i+20;
    }

    //Array to hold index values
    let idx=[];

    //Fill index array
    for(let i=0; i<=max/20; i++){
        idx.push(i);
    }
    //idx.push(0);

    return {
        index: idx,
        normal: n,
        position: p
    };
};