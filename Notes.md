Mental model (lock this in)

- DOM is a view
- State(Variable) is the source of truth

Rule to follow

- Start simple → grow when needed

### Why is render() checking theme AND sidebar every time?

- First: This is intentional
  - So every time State changes
  - You call render()
  - UI syncs completely

- Why re-check everything?
  - Because, You’re not saying what changed
  - You’re saying “here’s the current state, make UI match it”

- When to optimize later
  - Only when render becomes huge
  - performance actually suffers
  - UI becomes complex

- All decision in **JavaScript(js file)** should be made based on state
  - Check state before doing anything instead of css like active class, etc

- 🧠 One important shift now
  - Stop thinking: “How do I manipulate DOM?”
  - Start thinking: “How do I represent this in state?”

```javascript
When u are adding event listner pay attention where you are adding it. You should add on element which will not get re-render(load -> detele -> get loaded again) once page loads. Because if u add event listener to element and then they gets removed and added again, you would need to add the event listener again to the elements.
e.g) You have list
<div class="todo-list">
    <div class="todo">work</div>
    <div class="todo">rest</div>
</div>
if u add event listener on .todo instead of .todo-list then for every .todo you would need to add event listener. if all .todo are refresh you would need to add event listener again.
```

Derived state is a UI development approach where data is calculated on-the-fly from existing props or state rather than being stored independently

- Early optimization becomes dangerous when it:
  - complicates readability
  - adds abstraction too early
  - makes code harder to reason about

### The real performance bottlenecks in frontend apps are usually:

- excessive rerenders
- layout thrashing
- huge DOM trees
- unnecessary network calls
- large bundle size
- NOT: `querySelectorAll()` called a few times.

