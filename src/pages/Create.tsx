// src/pages/Create.tsx
import { useState, useMemo, useRef, useEffect } from "react";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program, utils, Idl, BN } from "@project-serum/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { supabase } from "@/lib/supabase";
import { IDL } from "../constants/idl";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PROGRAM_ID as PDA_ID } from "../constants/programID";
import { nanoid } from "nanoid";
import { addDays, addMinutes, format, formatDate } from "date-fns";
import { TZDate } from "@date-fns/tz";
import MDEditor from "@uiw/react-md-editor";
import {
  FaDiscord,
  FaInstagram,
  FaLink,
  FaTelegram,
  FaXTwitter,
} from "react-icons/fa6";
import { Tier } from "@/types/supabase";
import { toast } from "sonner";

const PROGRAM_ID = new PublicKey(PDA_ID);
const CAMPAIGN_SEED = "campaign";
const VAULT_SEED = "vault";
const LAMPORTS_PER_SOL = 1000000000;

const ALL_PLATFORMS = [
  { key: "x", label: "X", icon: <FaXTwitter /> },
  { key: "website", label: "Website", icon: <FaLink /> },
  { key: "discord", label: "Discord", icon: <FaDiscord /> },
  { key: "telegram", label: "Telegram", icon: <FaTelegram /> },
  { key: "instagram", label: "Instagram", icon: <FaInstagram /> },
];

export default function Create() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  // Wizard step
  const [step, setStep] = useState(1);

  // Form state
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [socials, setSocials] = useState<{ platform: string; url: string }[]>([
    { platform: "x", url: "" },
  ]);
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [daysLeft, setDaysLeft] = useState<number>(30);
  const [goal, setGoal] = useState<number>(10);
  const [tiers, setTiers] = useState<Tier[]>([
    { amount: 50, title: "", description: "", nftRewardCount: 1 },
  ]);
  const [isLoading, setLoading] = useState(false);
  const owner = wallet?.publicKey.toBase58() || "";

  // dropdown open state
  const [adding, setAdding] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!adding) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setAdding(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [adding]);

  // add a new social link
  const addPlatform = (key: string) => {
    setSocials((prev) => [...prev, { platform: key, url: "" }]);
    setAdding(false);
  };

  // update a URL in the list
  const updateUrl = (idx: number, url: string) =>
    setSocials((prev) => prev.map((s, i) => (i === idx ? { ...s, url } : s)));

  // remove a link
  const removeLink = (idx: number) =>
    setSocials((prev) => prev.filter((_, i) => i !== idx));

  // platforms not yet added
  const available = ALL_PLATFORMS.map((p) => p.key).filter(
    (k) => !socials.some((s) => s.platform === k)
  );

  // Anchor provider & program instances
  const provider = useMemo(
    () =>
      wallet
        ? new AnchorProvider(connection, wallet, {
            preflightCommitment: "processed",
          })
        : null,
    [connection, wallet]
  );

  const program = useMemo(
    () => (provider ? new Program(IDL as Idl, PROGRAM_ID, provider) : null),
    [provider]
  );

  // Navigation
  const next = () => setStep((s) => Math.min(s + 1, 3));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  // Tier handlers
  const updateTier = <K extends keyof Tier>(
    idx: number,
    key: K,
    value: Tier[K]
  ) =>
    setTiers((ts) =>
      ts.map((t, i) => (i === idx ? { ...t, [key]: value } : t))
    );

  // remove
  const removeTier = (idx: number) =>
    setTiers((ts) => ts.filter((_, i) => i !== idx));

  // add
  const addTier = () =>
    setTiers((ts) => [
      ...ts,
      { amount: 0, title: "", description: "", nftRewardCount: 1 },
    ]);

  const handleSubmit = async () => {
    if (!wallet || !program) {
      toast.error("Please connect your wallet first.");
      return;
    }
    setLoading(true);

    try {
      // 1️⃣ Generate your nanoid + PDA
      const campaignId = nanoid();
      const idBytes = utils.bytes.utf8.encode(campaignId);

      const [campaignPda] = await PublicKey.findProgramAddress(
        [
          Buffer.from(CAMPAIGN_SEED),
          wallet.publicKey.toBuffer(),
          Buffer.from(idBytes),
        ],
        PROGRAM_ID
      );
      const [vaultPda] = await PublicKey.findProgramAddress(
        [Buffer.from(VAULT_SEED), campaignPda.toBuffer()],
        PROGRAM_ID
      );

      const now = new Date();
      const expiration = addDays(now, daysLeft);
      const expirationUnix = Math.floor(expiration.getTime() / 1000);
      const expirationUtcFormatted = expiration.toUTCString();

      const confirmation = confirm(
        `Your campaign will expire on ${expirationUtcFormatted} ${expirationUnix}. Continue?`
      );

      if (!confirmation) return;

      await program.methods
        .initialize(
          campaignId,
          new BN(goal * LAMPORTS_PER_SOL),
          new BN(expirationUnix)
        )
        .accounts({
          campaign: campaignPda,
          vault: vaultPda,
          initializer: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      // 3️⃣ Upload all pendingImages
      const image_urls: string[] = [];
      for (const file of pendingImages) {
        const path = `campaign-${campaignPda.toBase58()}/${file.name}`;
        const { error: uploadErr } = await supabase.storage
          .from("campaign-images")
          .upload(path, file);
        if (uploadErr) {
          console.error("Image upload error:", uploadErr);
          continue;
        }
        const { data: urlData } = supabase.storage
          .from("campaign-images")
          .getPublicUrl(path);
        image_urls.push(urlData.publicUrl);
      }

      const mainImage = image_urls.length > 0 ? image_urls[0] : "";

      // 4️⃣ Insert metadata into Supabase
      const { error: sbError } = await supabase.from("campaigns").insert({
        id: campaignPda.toBase58(),
        campaign_id: campaignId,
        owner,
        title,
        short_description: shortDescription,
        long_description: longDescription,
        image_url: mainImage,
        image_urls,
        campaign_length: daysLeft,
        expiration: expirationUtcFormatted,
        goal_sol: goal,
        tiers,
        socials,
      });
      if (sbError) throw sbError;

      toast.success("Campaign created successfully!");
      window.location.href = "/explore";
    } catch (e) {
      console.error(e);
      toast.error("Error creating campaign: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal text-foreground flex flex-col">
      <main className="flex-grow py-12">
        <div className="container px-4 md:px-8 max-w-5xl mx-auto">
          <div className="bg-card rounded-xl border border-border p-8 space-y-6">
            <h1 className="text-3xl text-emerald font-bold">
              Create Your Campaign
            </h1>

            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex flex-col justify-start gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Digital Renaissance Collection"
                    required
                  />
                </div>
                <div className="flex flex-col justify-start gap-2">
                  <Label htmlFor="shortDescription">
                    Short Description{" "}
                    <span className="text-muted-foreground">
                      (max 50 characters)
                    </span>
                  </Label>
                  <Input
                    id="shortDescription"
                    value={shortDescription}
                    maxLength={50}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="A bold project tagline!"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    {shortDescription.length} / 50 characters
                  </p>
                </div>

                <div className="flex flex-col justify-start gap-2">
                  <Label htmlFor="longDescription">
                    Long Description (Markdown Supported)
                  </Label>
                  <MDEditor
                    className="bg-background"
                    value={longDescription}
                    onChange={(val) => setLongDescription(val || "")}
                  />
                </div>

                <div className="flex flex-col space-y-4">
                  <Label>Social Links</Label>

                  {socials.map((s, idx) => {
                    const { label, icon } = ALL_PLATFORMS.find(
                      (p) => p.key === s.platform
                    )!;
                    return (
                      <div key={s.platform} className="flex items-center gap-2">
                        <div className="text-2xl">{icon}</div>
                        <Input
                          type="url"
                          value={s.url}
                          placeholder={label}
                          onChange={(e) => updateUrl(idx, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => removeLink(idx)}
                        >
                          ×
                        </Button>
                      </div>
                    );
                  })}

                  {available.length > 0 && (
                    <div className="relative inline-block" ref={dropdownRef}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAdding((a) => !a)}
                      >
                        + Add Link
                      </Button>

                      {adding && (
                        <div className="absolute left-0 mt-1 w-48 bg-background p-2 border border-border rounded shadow-lg z-10">
                          {available.map((key) => {
                            const { label, icon } = ALL_PLATFORMS.find(
                              (p) => p.key === key
                            )!;
                            return (
                              <button
                                key={key}
                                className="flex items-center gap-2 w-full px-2 py-1 hover:bg-accent rounded"
                                onClick={() => addPlatform(key)}
                              >
                                <span className="text-xl">{icon}</span>
                                <span>{label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex flex-col">
                  <Label htmlFor="imageUrl">
                    Image URL{" "}
                    <span className="text-sm text-muted-foreground">
                      (We highly recommend using a 16:9 aspect ratio)
                    </span>
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={pendingImages.length >= 5}
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setPendingImages((prev) => [...prev, ...files]);
                    }}
                    className=" h-auto file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-emerald file:text-white
                                hover:file:bg-emerald/80"
                  />
                  {pendingImages.length >= 5 && (
                    <p className="text-sm text-red-400">
                      You can only upload up to 5 images.
                    </p>
                  )}
                  {pendingImages.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {pendingImages.map((file, idx) => (
                        <li
                          key={idx}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-6">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                            <span className="text-sm">{file.name}</span>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              setPendingImages((prev) =>
                                prev.filter((_, i) => i !== idx)
                              )
                            }
                          >
                            Remove
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Funding & Tiers */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="goal">Goal (SOL)</Label>
                    <Input
                      id="goal"
                      type="number"
                      value={goal}
                      onChange={(e) => setGoal(e.target.valueAsNumber)}
                      placeholder="200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="daysLeft">Deadline (days)</Label>
                    <select
                      id="daysLeft"
                      className="w-full bg-secondary/30 border border-border rounded-md p-3"
                      value={daysLeft}
                      onChange={(e) => setDaysLeft(Number(e.target.value))}
                    >
                      <option value={0}>0 (Test)</option>
                      <option value={0.08}>5 Min</option>
                      <option value={1}>1 (Test)</option>
                      <option value={30}>30</option>
                      <option value={60}>60</option>
                      <option value={90}>90</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label className="block mb-2 text-sm font-medium">
                    Reward Tiers
                  </Label>

                  {/* Column headers */}
                  <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground mb-1">
                    <div className="col-span-2">Cost (SOL)</div>
                    <div className="col-span-2">Title</div>
                    <div className="col-span-4">Description</div>
                    <div className="col-span-3"># of NFTs</div>
                    <div className="col-span-1" /> {/* remove button */}
                  </div>

                  {/* Tier rows */}
                  <div className="space-y-2">
                    {tiers.map((tier, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-12 gap-2 items-center"
                      >
                        {/* Cost input */}
                        <Input
                          type="number"
                          className="col-span-2"
                          min={0}
                          value={tier.amount}
                          onChange={(e) =>
                            updateTier(idx, "amount", e.target.valueAsNumber)
                          }
                          placeholder="0"
                        />

                        {/* Title input */}
                        <Input
                          type="text"
                          className="col-span-2"
                          value={tier.title}
                          onChange={(e) =>
                            updateTier(idx, "title", e.target.value)
                          }
                          placeholder="Title"
                        />

                        {/* Description input */}
                        <Input
                          className="col-span-4"
                          value={tier.description}
                          onChange={(e) =>
                            updateTier(idx, "description", e.target.value)
                          }
                          placeholder="What do backers get?"
                        />

                        {/* NFT count input */}
                        <Input
                          type="number"
                          className="col-span-3"
                          min={1}
                          value={tier.nftRewardCount}
                          onChange={(e) =>
                            updateTier(
                              idx,
                              "nftRewardCount",
                              e.target.valueAsNumber
                            )
                          }
                          placeholder="1"
                        />

                        {/* Remove button */}
                        <Button
                          variant="destructive"
                          size="icon"
                          className="col-span-1"
                          onClick={() => removeTier(idx)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Add tier */}
                  <Button variant="outline" className="mt-4" onClick={addTier}>
                    + Add Tier
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Review</h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>Title:</strong> {title}
                  </li>
                  <li>
                    <strong>Short Description:</strong> {shortDescription}
                  </li>
                  <li>
                    <strong>Image URL:</strong> {imageUrl}
                  </li>
                  <li>
                    <strong>Owner:</strong> {owner}
                  </li>
                  <li>
                    <strong>Goal:</strong> {goal} SOL
                  </li>
                  <li>
                    <strong>Deadline:</strong> {daysLeft} days
                  </li>
                  <li>
                    <strong>Expiration:</strong>{" "}
                    {format(
                      addDays(new Date(), daysLeft),
                      "MMMM do, yyyy 'at' h:mm a"
                    )}
                  </li>
                  <li>
                    <strong>Tiers:</strong>
                    <ul className="pl-5 list-circle">
                      {tiers.map((t, i) => (
                        <li key={i}>
                          {t.amount} SOL → {t.nftRewardCount} NFTs
                        </li>
                      ))}
                    </ul>
                  </li>
                </ul>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              {step > 1 ? (
                <Button variant="outline" onClick={back}>
                  Back
                </Button>
              ) : (
                <div />
              )}
              {step < 3 ? (
                <Button onClick={next} disabled={isLoading}>
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-emerald"
                >
                  {isLoading ? "Creating…" : "Launch Campaign"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
