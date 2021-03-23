import './App.css';
import {MultiSelect, MultiSelectOption as Option} from './MultiSelect';

function App() {
  const options = ["Australia", "Belgium","Canada","France","Germany","India","Mexico","Nepal","Pakistan","South Africa","Sri Lanka","United States"]
  return <MultiSelect width='300px'>
    {options.map( (values, index)=> <Option key={index} value={values}>{values}</Option>)}
  </MultiSelect>
}

export default App;