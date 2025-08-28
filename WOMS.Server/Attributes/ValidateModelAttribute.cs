using WOMS.Server.Validations;

namespace WOMS.Server.Attributes
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class ValidateModelAttribute : ActionFilterAttribute
    {
        public string Exclude { get; set; } = null!;
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            if (!string.IsNullOrWhiteSpace(Exclude))
            {
                string[] excludes = Exclude.Split(',');
                foreach (var exclude in excludes)
                {
                    context.ModelState.Remove(exclude);
                }
            }

            if (!context.ModelState.IsValid)
            {
                context.Result = new ValidationFailedResult(context.ModelState);
            }
        }
    }
}
