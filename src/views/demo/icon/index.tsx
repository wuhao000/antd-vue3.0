import AIcon from '@/components/icon';
import {defineComponent} from 'vue';

export default defineComponent({
  setup() {
    return () => <div>
      <AIcon style={{color: 'red'}} type="desktop"/>
      <div class="icons-list">
        <AIcon type="smile" theme="twoTone"/>
        <AIcon type="heart" theme="twoTone" twoToneColor="#eb2f96"/>
        <AIcon type="check-circle" theme="twoTone" twoToneColor="#52c41a"/>
      </div>
      <div class="icons-list">
        <AIcon type="home"/>
        <AIcon type="setting" theme="filled"/>
        <AIcon type="smile" theme="outlined"/>
        <AIcon type="sync" spin={true}/>
        <AIcon type="smile" rotate="180"/>
        <AIcon type="loading"/>
      </div>
    </div>;
  }
});
