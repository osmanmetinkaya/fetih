# oyun sabitlerinden hesaplanan (bot gerektirmeyen) geri ödeme / birim tabloları
import json
SP='/private/tmp/claude-501/-Users-osman/43ff13d3-c66b-4b6c-9bc1-b657fa0f123e/scratchpad'
LVM=[0,1,2.2,3.6,5.2,7]
F={'tarla':(3,{'tahil':25,'odun':5}),'kereste':(3,{'tahil':25,'altin':5}),'tasocagi':(3,{'tahil':30,'odun':10}),'demir':(2.5,{'tahil':35,'odun':15}),'pazar':(3,{'tahil':30,'tas':10}),'medrese':(2,{'tahil':40,'tas':15})}
out={'tesis':{}}
for t,(b,c) in F.items():
    rows=[]
    for lv in range(1,5):
        m=(lv+1)**1.7;cost={k:round(v*m,1) for k,v in c.items()};gain=b*(LVM[lv+1]-LVM[lv]);tot=sum(cost.values())
        rows.append({'sv':f'{lv}->{lv+1}','maliyet':cost,'ek_uretim_eff1':round(gain,2),'geri_odeme_tur(maliyet toplami/ek uretim)':round(tot/gain,1)})
    new1=sum(c.values());out['tesis'][t]={'yeni_kurulus_toplam_maliyet(5 tesis varken x2)':round(sum(v*2 for v in c.values()),1),'sv1_uretim':b,'kademeler':rows}
U={'piy':(1,1,1,1,{'altin':3,'tahil':2}),'okc':(.8,1.6,1,1,{'altin':3,'tahil':2,'odun':2}),'suv':(1.7,.9,2,2,{'altin':6,'tahil':4,'demir':2}),'kus':(.6,.4,2,1.5,{'altin':4,'odun':8,'demir':2}),'yen':(2.2,2,3,2,{'altin':10,'tahil':3,'demir':3})}
pop={'piy':1,'okc':1,'suv':1,'kus':2,'yen':1}
ut={}
for k,(a,d,w,up,c) in U.items():
    g=c.get('altin',0);tot=sum(c.values())
    ut[k]={'saldiri_per_altin':round(a/g,3),'savunma_per_altin':round(d/g,3),'saldiri_per_toplam_maliyet':round(a/tot,3),'saldiri_per_nufus':round(a/pop[k],2),'saldiri_per_bakim':round(a/up,2),'saldiri_per_alim_hakki(w)':round(a/w,2),'savunma_per_nufus':round(d/pop[k],2)}
out['birim']=ut
# kademe maliyetleri vs. tipik gelir (bot ort. tur 40 net: tas 6.4, odun 17, altin 18.5)
M=[(2,{'odun':40,'tas':25,'altin':35}),(3,{'odun':60,'tas':50,'altin':60,'demir':15}),(4,{'odun':90,'tas':80,'altin':100,'demir':30}),(5,{'tas':130,'altin':160,'demir':50,'bilgi':20})]
inc={'tas':6.4,'odun':17,'altin':18.5,'demir':5.8,'bilgi':6.4}
out['kademe']=[{'kademe':n,'maliyet':c,'tur40_net_gelirle_tur_ihtiyaci(kaynak basina)':{k:round(v/inc[k],1) for k,v in c.items()}} for n,c in M]
json.dump(out,open(SP+'/eanalytic.json','w'),ensure_ascii=False)
print(json.dumps(out,ensure_ascii=False)[:3000])
