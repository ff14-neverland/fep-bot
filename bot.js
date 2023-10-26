import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';

import Fep from './lib/fep.js';
import QQ from './lib/qq.js';
import Common from './lib/common.js';

const configFile = fs.readFileSync('./config.json', 'utf-8');
const config = JSON.parse(configFile);

//參考 https://satori.js.org/zh-CN/protocol/events.html 建立Websocket 接收指令
const ws = new WebSocket(`ws://${config.satoriUrl}/v1/events`);

ws.on('error', console.error);

/* 连接建立后，在 10s 内发送一个 IDENTIFY 信令，用于鉴权和恢复会话；
SDK 收到后会回复一个 READY 信令，并开启事件推送；
*/
ws.on('open', function open() {
  const token = JSON.stringify({
    'op': 3,
    'body':{
      'token': config.satoriToken,
    }
  }
);
ws.send(token);
});

ws.on('message', async function message(data) {
  console.log('received: %s', data);
  const jsonData = JSON.parse(data);
  //假如接收到的事件為Message，讀取內容
  if(jsonData.body && jsonData.body.channel && jsonData.body.channel.type === 0){
    const dataBody = jsonData.body;
    const userId = dataBody.user.id;
    const senderId = dataBody.channel.id;
    const messageContent = dataBody.message.content;
    const command = QQ.readCommand(messageContent);

    switch(command){
      case 'help':
      _getHelp(senderId);
      break;

      case 'battle':
      _getBattle(senderId, messageContent);
      break;

      case 'status':
      _getStatus(senderId, messageContent);
      break;

      case 'level':
      _getLevelUp(senderId, messageContent);
      break;

      case 'spt':
      _getSupport(senderId, messageContent);
      break;

      case 'other':
      _getOther(senderId, messageContent);
      break;

      case 'support':
      _updateSupport(senderId, messageContent);
      break;

      case 'item':
      _updateItem(senderId, messageContent);
      break;
    }
  }
});

async function _getStatus(senderId, messageContent){
  const statusRegax = /^(\/status) ([\s\S]*)$/;
  const charaName = statusRegax.exec(messageContent)[2];
  const status = await Fep.getStatus(config, charaName);
  let content = `【${charaName} HP ${status.HP}， 力量 ${status.力量}，魔力 ${status.魔力}，技巧 ${status.技巧}，幸运 ${status.幸运}，速度 ${status.速度}，防御 ${status.防御}，魔防 ${status.魔防}】`;
  const result = await QQ.sendMessage(senderId, content, config);
}

async function _getBattle(senderId, messageContent){
  const battleRegax = /^(\/battle) ([\s\S]*) ([\s\S]*)$/;
  const chara1 = battleRegax.exec(messageContent)[2];
  const chara2 = battleRegax.exec(messageContent)[3];
  const battleResult = await Fep.getBattleResult(config, chara1, chara2);
  let content = `${chara1}攻击${chara2}，物理伤害${battleResult.chara1.phyical_damage}，魔法伤害${battleResult.chara1.magical_damage}，命中率${battleResult.chara1.hit_rate}，暴击率${battleResult.chara1.critical_rate}，`;
  if(battleResult.chara1.pursue == true){
    content += '追击.';
  }else{
    content += '不追击.';
  }
  content += `\n反击，物理伤害${battleResult.chara2.phyical_damage}，魔法伤害${battleResult.chara2.magical_damage}，命中率${battleResult.chara2.hit_rate}，暴击率${battleResult.chara2.critical_rate}，`;
  if(battleResult.chara2.pursue == true){
    content += '追击';
  }else{
    content += '不追击';
  }
  const result = await QQ.sendMessage(senderId, content, config);
}

async function _getHelp(senderId){
  let content = '目前指令：';
  content += '\n /status 查看角色能力值';
  content += '\n /battle (角色名1) (角色名2) 生成戰鬥結果';
  content += '\n /spt (角色名) 查看支援狀態';
  content += '\n /other (角色名) 查看角色其他訊息';
  content += '\n /support (角色名) (訊息) 更新角色支援訊息';
  content += '\n /update (角色名) (訊息) 更新角色其他訊息';
  const result = await QQ.sendMessage(senderId, content, config);
  console.log(result);
}

async function _getLevelUp(senderId, messageContent){
  const levelRegax = /^(\/level) ([\s\S]*)$/;
  const chara = levelRegax.exec(messageContent)[2];
  const levelResult = await Fep.getLevelUpResult(config, chara);
  let content = `${chara} `;
  if(levelResult.hp){
    content += 'HP+1，';
  }
  if(levelResult.power){
    content += '力量+1，';
  }
  if(levelResult.magical){
    content += '魔力+1，';
  }
  if(levelResult.skill){
    content += '技巧+1，';
  }
  if(levelResult.luck){
    content += '幸运+1，';
  }
  if(levelResult.speed){
    content += '速度+1，';
  }
  if(levelResult.defense){
    content += '防御+1，';
  }
  if(levelResult.magical_defense){
    content += '魔防+1';
  }
  content += `\n (${levelResult.hp_growth_result}, ${levelResult.power_growth_result}, ${levelResult.magical_growth_result}, ${levelResult.skill_growth_result}, ${levelResult.luck_growth_result}, ${levelResult.speed_growth_result}, ${levelResult.defense_growth_result}, ${levelResult.magical_defense_growth_result})`;
  const result = await QQ.sendMessage(senderId, content, config);
}

async function _getSupport(senderId, messageContent){
  const sptRegax = /^(\/spt) ([\s\S]*)$/;
  const charaName = sptRegax.exec(messageContent)[2];
  const status = await Fep.getStatus(config, charaName);
  let content = `${charaName} 支援状态：${status['支援']}`;
  const result = await QQ.sendMessage(senderId, content, config);
}

async function _getOther(senderId, messageContent){
  const otherRegax = /^(\/other) ([\s\S]*)$/;
  const charaName = otherRegax.exec(messageContent)[2];
  const status = await Fep.getStatus(config, charaName);
  let content = `${charaName} ：${status['其他']}`;
  const result = await QQ.sendMessage(senderId, content, config);
}

async function _updateSupport(senderId, messageContent){
  const supportRegax = /^(\/support) ([\s\S]*) ([\s\S]*)$/;
  const charaName = supportRegax.exec(messageContent)[2];
  const updateContent = supportRegax.exec(messageContent)[3];
  const updateResult = await Fep.updateSupport(config, charaName, updateContent);
  let content = `${charaName} 支援已更新`;
  const result = await QQ.sendMessage(senderId, content, config);
}

async function _updateItem(senderId, messageContent){
  const itemRegax = /^(\/update) ([\s\S]*) ([\s\S]*)$/;
  const charaName = itemRegax.exec(messageContent)[2];
  const updateContent = itemRegax.exec(messageContent)[3];
  const updateResult = await Fep.updateOther(config, charaName, updateContent);
  let content = `${charaName} 信息已更新`;
  const result = await QQ.sendMessage(senderId, content, config);
}

/* 连接建立后，每隔 10s 向 SDK 发送一次 PING 信令；
SDK 收到后会回复一个 PONG 信令；
*/

function sendPong(){
  const ping = JSON.stringify({
    'op': 1,
  });
  ws.send(ping);
}

setInterval(sendPong, 10000);
