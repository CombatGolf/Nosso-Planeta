/* Apenas a chave publicável: o RPC retorna posição, apelido e XP. */
(function(){'use strict';
  const root=document.getElementById('ecoquest-public-rank');
  if(!root)return;
  const endpoint='https://bccivdjincstvwawavhw.supabase.co/rest/v1/rpc/ecoquest_public_leaderboard';
  const publishableKey='sb_publishable_GDSdSFdZoD9aXUlcJhcQDg_5H6xSLW4';
  const list=document.getElementById('ecoquest-rank-list');
  const status=document.getElementById('ecoquest-rank-status');
  const empty=document.getElementById('ecoquest-rank-empty');
  const button=document.getElementById('ecoquest-rank-refresh');
  let loading=false;
  function announce(text,kind){status.textContent=text;status.dataset.kind=kind}
  function render(rows){
    const items=document.createDocumentFragment();
    for(const row of rows){
      const item=document.createElement('li');
      const place=document.createElement('strong');place.textContent='#'+Math.max(1,Number(row.place)||1);
      const nickname=document.createElement('span');nickname.textContent=String(row.nickname||'EcoExplorador');
      const points=document.createElement('b');points.textContent=Math.max(0,Number(row.cloud_xp)||0)+' XP';
      item.append(place,nickname,points);items.appendChild(item);
    }
    list.replaceChildren(items);empty.hidden=rows.length!==0;
  }
  async function refresh(){
    if(loading)return;
    if(!navigator.onLine){announce('Sem internet. O ranking exibido pode estar desatualizado.','offline');return}
    loading=true;button.disabled=true;announce('Atualizando ranking...','info');
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),12000);
    try{
      const response=await fetch(endpoint,{method:'POST',headers:{apikey:publishableKey,'Content-Type':'application/json'},body:'{}',cache:'no-store',signal:controller.signal});
      if(!response.ok)throw new Error('Ranking indisponível');
      const rows=await response.json();
      if(!Array.isArray(rows))throw new Error('Resposta inesperada');
      render(rows);
      const time=new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
      announce(rows.length+' '+(rows.length===1?'participante':'participantes')+' · atualizado às '+time+'.','success');
    }catch(error){announce('Não foi possível atualizar o ranking. Tente novamente com internet.','error')}
    finally{clearTimeout(timeout);loading=false;button.disabled=false}
  }
  button.addEventListener('click',refresh);
  window.addEventListener('online',refresh);
  window.addEventListener('offline',()=>announce('Sem internet. O ranking exibido pode estar desatualizado.','offline'));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
  setInterval(()=>{if(!document.hidden)refresh()},30000);
  refresh();
})();
