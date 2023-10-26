import querystring from 'querystring';
import striptags from 'striptags';
const Fep = {
  async getStatus(config, charaName){
    const query = querystring.stringify({
      'chara': charaName,
    });
    const response = await fetch(`${config.apiUrl}/status?${query}`);
    const datas = await response.json();
    return datas;
  },
  async getBattleResult(config, chara1, chara2){
    const query = querystring.stringify({
      'chara1': chara1,
      'chara2': chara2,
    });
    const response = await fetch(`${config.apiUrl}/battle?${query}`);
    const datas = await response.json();
    return datas;
  },
  async getLevelUpResult(config, charaName){
    const query = querystring.stringify({
      'chara': charaName,
    });
    const response = await fetch(`${config.apiUrl}/level?${query}`);
    const datas = await response.json();
    return datas;
  },
  async updateSupport(config, charaName, content){
    const options = {
      method: 'POST',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
        'chara': charaName,
        'type': 'support',
        'text': content,
      })
    };
    const response = await fetch(`${config.apiUrl}/update`, options);
    const data = await response.json();
    return data;
  },
  async updateOther(config, charaName, content){
    const options = {
      method: 'POST',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
        'chara': charaName,
        'type': 'other',
        'text': content,
      })
    };
    const response = await fetch(`${config.apiUrl}/update`, options);
    const data = await response.json();
    return data;
  },
}
export default Fep;
