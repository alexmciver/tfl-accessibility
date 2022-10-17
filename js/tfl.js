export const fetchTFL = async () => {
      fetch("https://tfl.gov.uk/tfl/syndication/feeds/step-free-tube-guide.xml")
      .then(response => response.text())
      .then(data => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(data, "application/xml");
        console.log(xml);

            var x, i, txt;
            txt = "";
            x = xml.getElementsByTagName('StationName');
            for (i = 0 ; i <x.length; i++) {
                txt += x[i].childNodes[0].nodeValue + "<br>";
            }
            document.getElementById("demo").innerHTML = txt;
      })
      .catch(console.error);
  };