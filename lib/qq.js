import querystring from 'querystring';
import fetch from 'node-fetch';

const QQ = {
  /**
  * Read content and return command type
  * @param {String} Content of QQ Message.
  * @returns {String} Command Type of Message.
  *
  */
  readCommand(content){
    const battleRegax = /^(\/battle) ([\s\S]*) ([\s\S]*)$/;
    const statusRegax = /^(\/status) ([\s\S]*)$/;
    const levelRegax = /^(\/level) ([\s\S]*)$/;
    const sptRegax = /^(\/spt) ([\s\S]*)$/;
    const otherRegax = /^(\/other) ([\s\S]*)$/;
    const supportRegax = /^(\/support) ([\s\S]*) ([\s\S]*)$/;
    const itemRegax = /^(\/update) ([\s\S]*) ([\s\S]*)$/;
    const helpRegax = /(^\/help1$)/;

    if(content){
      if(content.match(helpRegax)){
        return 'help';
      }
      if(content.match(battleRegax)){
        return 'battle';
      }
      if(content.match(statusRegax)){
        return 'status';
      }
      if(content.match(levelRegax)){
        return 'level';
      }
      if(content.match(sptRegax)){
        return 'spt';
      }
      if(content.match(otherRegax)){
        return 'other';
      }
      if(content.match(supportRegax)){
        return 'support';
      }
      if(content.match(itemRegax)){
        return 'item';
      }
    }
  },
  async sendMessage(senderId, content, config){
    let apiUrl = `http://${config.satoriUrl}`;
    const body = {
      message: content,
    };
    const options = {
      method: 'POST',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
        'Authorization': `Bearer ${config.satoriToken}`
      },
      body: JSON.stringify({
        'channel_id': senderId,
        'content': content
      })
    };
    const response = await fetch(`http://${config.satoriUrl}/v1/message.create`, options);
    const resultJson = await response.json();
    return resultJson;
  }
}
export default QQ;
