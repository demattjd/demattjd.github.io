var readIn = function(file){
    var split = [];
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                split = allText.replace( /\n/g, " " ).split( " " );
                split = split.filter(function(str) {
                    return /\S/.test(str);
                });
                for(i=0; i<split.length; i++){
                    split[i] = Number(split[i]);
                }
                //console.log(split[20]);
            }
        }
    }
    rawFile.send(null);
    return split;
}