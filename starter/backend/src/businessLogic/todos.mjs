
export function isTodoNameInvalid(todoName){
  return !todoName || todoName.trim() === ''
}