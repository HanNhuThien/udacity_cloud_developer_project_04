
export function isTodoNameInvalid(todoName){
  return !todoName.name || todoName.trim() === ''
}