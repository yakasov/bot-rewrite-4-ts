const fs = require("fs");

async function getStuff() {
  let first100 = await fetch("https://json.edhrec.com/pages/top/salt.json")
    .then((r) => r.json())
    .then((j) => j.container.json_dict.cardlists[0].cardviews);

  const f = async (url = "top/salt--1.json") => {
    console.log(url, first100.length);
    const next100 = await fetch(`https://json.edhrec.com/pages/${url}`).then(
      (r) => r.json()
    );

    first100 = [...first100, ...next100.cardviews];

    if (next100.more) {
      await f(next100.more);
    }
  };

  await f();

  let dict = {};

  first100.map((e, i) => (dict[e.id] = i + 1));
  fs.writeFileSync("./resources/scryfall/salt.json", JSON.stringify(dict));

  console.log(first100.length);
}

(async () => {
  await getStuff();
})();
