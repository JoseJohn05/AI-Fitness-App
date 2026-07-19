# TypeScript Fixes for FitIntelligence.tsx

## Key Errors to Fix:

1. **Line 40**: `callAI` function needs type annotations
   ```typescript
   async function callAI(messages: Array<{role: string, content: string}>, system: string = ""): Promise<string> {
   ```

2. **Line 50**: `callVision` function needs type annotations
   ```typescript
   async function callVision(b64: string, mime: string, prompt: string): Promise<string> {
   ```

3. **Line 63**: `toB64` arrow function needs types
   ```typescript
   const toB64 = (f: File): Promise<string> => new Promise((res, rej) => {
   ```

4. **Line 65**: FileReader result needs type narrowing
   ```typescript
   rd.onload = () => res((rd.result as string).split(",")[1]);
   ```

5. **Line 70**: `safeParse` needs return type
   ```typescript
   const safeParse = (s: string): any | null => {
   ```

6. **Line 72**: catch block needs error type
   ```typescript
   catch (e: unknown) { return null; }
   ```

7. **Line 76-84**: useState calls need generic types
   ```typescript
   const [tab, setTab] = useState<string>("home");
   const [meals, setMeals] = useState<any[]>([]);
   const [mealResult, setMR] = useState<any | null>(null);
   const [scanResult, setSR] = useState<any | null>(null);
   const [shopList, setShop] = useState<any | null>(null);
   const [dietPlan, setDiet] = useState<any | null>(null);
   const [dailyTip, setTip] = useState<string>("");
   const [loading, setLoading] = useState<boolean>(false);
   const [notif, setNotif] = useState<{msg: string, type: string} | null>(null);
   ```

8. **Line 85-86**: useRef needs generic types
   ```typescript
   const mealRef = useRef<HTMLInputElement>(null);
   const scanRef = useRef<HTMLInputElement>(null);
   ```

9. **Line 90**: toast function needs types
   ```typescript
   const toast = (msg: string, type: string = "info"): void => {
   ```

10. **Line 95**: loadTip async function
    ```typescript
    const loadTip = async (): Promise<void> => {
    ```

11. **Line 102**: catch needs error parameter
    ```typescript
    catch (e: unknown) { setTip("💙 ...") }
    ```

12. **Line 105**: handleMeal function
    ```typescript
    const handleMeal = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    ```

13. **Line 121**: catch in handleMeal
    ```typescript
    catch (e: unknown) { toast("Could not analyze image...") }
    ```

14. **Line 125**: handleScan function
    ```typescript
    const handleScan = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    ```

15. **Line 136**: catch in handleScan
    ```typescript
    catch (e: unknown) { toast("Could not analyze product...") }
    ```

16. **Line 140**: genDiet function
    ```typescript
    const genDiet = async (): Promise<void> => {
    ```

17. **Line 148**: catch in genDiet
    ```typescript
    catch (e: unknown) { toast("Could not generate diet plan...") }
    ```

18. **Line 152**: genShop function
    ```typescript
    const genShop = async (): Promise<void> => {
    ```

19. **Line 163**: catch in genShop
    ```typescript
    catch (e: unknown) { toast("Could not generate list...") }
    ```

20. **Line 167**: toggleItem function
    ```typescript
    const toggleItem = (cat: string, idx: number): void => {
    ```

21. **Screen components**: Add return types
    ```typescript
    const Home = (): JSX.Element => (...)
    const Meals = (): JSX.Element => (...)
    const Scanner = (): JSX.Element => (...)
    const Shopping = (): JSX.Element => (...)
    const Progress = (): JSX.Element => (...)
    ```

22. **Main export**: Add return type
    ```typescript
    export default function FitIntelligence(): JSX.Element {
    ```

## File Location:
- Current: `public/fitintelligence.tsx` (❌ Wrong - public is for static assets)
- Should be: `src/app/page.tsx` or `src/components/FitIntelligence.tsx`

## Next Steps:
1. Fix all TypeScript annotations
2. Move file to `src/components/FitIntelligence.tsx`
3. Update Next.js page structure to import and use the component
4. Run `npm install` to install dependencies
5. Test with `npm run dev`
